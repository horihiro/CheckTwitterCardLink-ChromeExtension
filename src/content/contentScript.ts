'use strict';

import { CONNECTION_NAME, SELECTOR_CARD_EMBEDDED, SELECTOR_CARD_TIMELINE } from "../common/const";
import { Card } from "../types/card";

(async () => {
  let port: any = null;
  const cardMap: Map<String, Card> = new Map();
  const isSubdomainOf = (subdomain, domain) => {
    const subdomainParts = subdomain.split('.');
    const domainParts = domain.split('.');
    if (subdomainParts.length < domainParts.length) return false;
    const subdomainPartsToCheck = subdomainParts.slice(-domainParts.length);
    return subdomainPartsToCheck.join('.') === domainParts.join('.');
  };
  const onMessage = (message) => {
    const card: Card | undefined = cardMap.get(message.id);
    if (!card) return;
    card.redirectTo = message.redirectTo;
    if (isSubdomainOf(card.redirectTo, card.shownAs)) {
      card.element.setAttribute('data-validated', 'true');
      card.element.querySelectorAll('a').forEach((a) => {
        a.onclick = null;
      });
      return;
    }
    card.element.setAttribute('data-validated', 'false');
    card.element.querySelectorAll('a').forEach((a) => {
      a.onclick = (e) => {
        if (window.confirm(`Are you sure you want to go to '${card.redirectTo}', not '${card.shownAs}'?`)) return true;
        e.preventDefault();
        e.stopPropagation();
        return false;
      };
    });
    console.log(card);
  };
  const validateUrl = async (params) => {
    try {
      port.postMessage(params);
    } catch (error) {
      port = chrome.runtime.connect(chrome.runtime.id, { name: CONNECTION_NAME });
      port.onMessage.addListener(onMessage);
      port?.postMessage(params);
    }
  };
  const observer = new MutationObserver((mutations) => {
    if (mutations.filter((mutation/* , i, array */) => mutation.addedNodes.length > 0).length === 0) return;
    const toBeValidated = document.querySelectorAll(['twitter.com', 'x.com'].includes(location.hostname)
       ? SELECTOR_CARD_TIMELINE
       : SELECTOR_CARD_EMBEDDED
    );
    if (toBeValidated.length === 0) return;
    toBeValidated.forEach((cardElement) => {
      const linkTo = cardElement.querySelector('a')?.href;
      if (!linkTo) return;
      const linkedHost = new URL(linkTo).hostname;
      const shownAs = cardElement.querySelector('a span')?.textContent || '';
      if (isSubdomainOf(linkedHost, shownAs) /* linkedHost.length === linkedHost.indexOf(shownAs) + shownAs.length */) {
        cardElement.setAttribute('data-validated', 'true');
        return;
      }
      const card: Card = {
        linkTo,
        shownAs,
        element: cardElement
      }
      const id = cardElement.id || cardElement.getAttribute('aria-labelledby');
      if (!id) return;
      cardMap.set(id, card);
      cardElement.setAttribute('data-validated', 'validating');
      console.log(cardElement.getAttribute('aria-labelledby'));
      card.element.querySelectorAll('a').forEach((a) => {
        a.onclick = (e) => {
          if (window.confirm(`Validating a link in this card. Are you sure you want to open this?`)) return true;
          e.preventDefault();
          e.stopPropagation();
          return false;
        };
      });
      validateUrl({ url: linkTo, id });
    });
  });
  const style = document.createElement('style');
  style.innerHTML = `
    *[data-validated="false"] a {
      cursor: not-allowed;
    }`;
  document.head.appendChild(style);
  const config = {
    childList: true,
    subtree: true,
  };
  observer.observe(document.body, config);
})();

// Content script file will run in the context of web page.
// With content script you can manipulate the web pages using
// Document Object Model (DOM).
// You can also pass information to the parent extension.

// We execute this script by making an entry in manifest.json file
// under `content_scripts` property

// For more information on Content Scripts,
// See https://developer.chrome.com/extensions/content_scripts

// Log `title` of current active web page
// const pageTitle = document.head.getElementsByTagName('title')[0].innerHTML;
// console.log(
//   `Page title is: '${pageTitle}' - evaluated by Chrome extension's 'contentScript.js' file`
// );

// // Communicate with background file by sending a message
// chrome.runtime.sendMessage(
//   {
//     type: 'GREETINGS',
//     payload: {
//       message: 'Hello, my name is Con. I am from ContentScript.',
//     },
//   },
//   (response: any) => {
//     console.log(response.message);
//   }
// );




// // Listen for message
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.type === 'COUNT') {
//     console.log(`Current count is ${request.payload.count}`);
//   }

//   // Send an empty response
//   // See https://github.com/mozilla/webextension-polyfill/issues/130#issuecomment-531531890
//   sendResponse({});
//   return true;
// });

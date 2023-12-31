'use strict';

import { DOMAINS_HTTP_GET } from "../common/const";

chrome.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener(async (message) => {
    const fetchOptions = {
      redirect: 'follow',
      credentials: 'same-origin',
      cache: 'no-cache',
      mode: 'cors'
    };
    try {
      const targetUrl = !DOMAINS_HTTP_GET.includes(new URL(message.url).hostname) ? message.url : await (async (url) => {
        const response = await fetch(url, Object.assign(fetchOptions, { method: 'GET' }) as RequestInit);
        const { status, headers } = response;
        const body = await response.text();
        if (status >= 200 && status < 300) {
          return body.replace(/.*;URL=([^"]*)".*/, '$1');
        } else if (status >= 300 && status < 400) {
          return headers?.get('location') || '';
        }
        return '';
      })(message.url);
      const response = await fetch(targetUrl, Object.assign(fetchOptions, { method: 'HEAD' }) as RequestInit);
      await response.text();
      const { status, url } = response;
      const redirectTo = new URL((status >= 300 && status < 400) ? url : await (async () => {
        const response = await fetch(targetUrl, Object.assign(fetchOptions, { method: 'GET' }) as RequestInit);
        await response.text();
        const { status, url } = response;
        return (status >= 200 && status < 300) ? url : targetUrl;
      })()).hostname;

      message.redirectTo = redirectTo;
    } catch (error) {
      console.error(error);
      message.redirectTo = message.url;
    }
    port.postMessage(message);
  });
});
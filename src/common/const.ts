export const DOMAINS_HTTP_GET = ['t.co'];
export const SELECTOR_CARD_TIMELINE = '*[data-testid="card.wrapper"]:not([data-validated])';
export const SELECTOR_CARD_EMBEDDED = ':has(>[data-testid="tweetText"]) + div > div:not([data-validated])';
export const CONNECTION_NAME = 'validateUrl';
export const REGEXP_DOMAIN = /^(?:[a-zA-Z\d\-]+\.)+[a-zA-Z]+$/;
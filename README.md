> [!IMPORTANT]
> Repository archived & extension unpublished since it's not necessary nor useful anymore with the new dashboard.

# Purpose

This extension helps you see what events have happened since your last visit to GitHub and what events you have already seen. It is compatible with both personal news feeds as well as organizations feeds.

<p align='center'>
  <img src='https://user-images.githubusercontent.com/1585006/167575842-ed53163a-89a8-4f82-afa4-0cbb1e2f9aaa.png' alt='Comparison image showing the "Following" personal feed with and without the extension' title='Comparison image showing the "Following" personal feed with and without the extension'>
</p>

<p align='center'>
  <img src='https://user-images.githubusercontent.com/1585006/167576080-2c0317a5-d8d6-4790-839d-e597f94a1cc3.png' alt='Comparison image showing the "For you" personal feed with and without the extension' title='Comparison image showing the "For you" personal feed with and without the extension'>
</p>

# Download links

<p align='center'>
  <a href="https://chrome.google.com/webstore/detail/whats-new-on-github/ldleapnlgbkpkabhbkkeangmnfpikahe">
    <img src='https://storage.googleapis.com/web-dev-uploads/image/WlD8wC6g8khYWPJUsQceQkhXSlv1/UV4C4ybeBTsZt43U4xis.png' alt='Chrome Web Store logo' title="Link to the extension's page on the Chrome Web Store">
  </a>
  <a href="https://addons.mozilla.org/en-US/firefox/addon/whats-new-github/">
    <img src='https://ffp4g1ylyit3jdyti1hqcvtb-wpengine.netdna-ssl.com/addons/files/2015/11/get-the-addon.png' alt='Firefox Add-ons logo' title="Link to the extension's page on the Firefox Add-ons website">
  </a>
</p>

# Reminders (for myself)

## Zipping

```bash
WNGH_VERSION=X.Y.Z
cd whats-new-github/
zip whats-new-github-v$WNGH_VERSION.zip icon/128.png icon/48.png index.js manifest.json
mv whats-new-github-v$WNGH_VERSION.zip ..
cd ..
```

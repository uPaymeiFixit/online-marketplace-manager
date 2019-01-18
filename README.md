# online-marketplace-manager
A CLI tool to post listings on Craigslist, Letgo, and Facebook Marketplace. At the moment, this works by opening Google chrome, switching between tabs, and emulating keypresses to enter data. It requires you to have each marketplace at the right stage before it begins typing. 

### Future Plans
1. Ideally this would use these marketplaces' API to post things, as this would likely be more reliable. 
2. Add ability to list posts
3. Add ability to manage (delete and edit) posts
4. Turn into Chrome extension

### Development Note
This is just a hobby project for myself, so I don't regularly maintain it. If there's something small you want fixed or added, feel free to open an issue for it or email me. 

Right now it relies on a Mac-only CLI tool, so it only works in Mac. 

## Installation
Install [Cliclick](https://www.bluem.net/en/projects/cliclick/)

Run ```npm install```


## Setup
1. Open a Google Chrome window
2. Open three tabs in this order: Craigslist, Facebook Marketplace, Letgo
3. For Craigslist, you will need to begin creating a post by selecting type of post (ex: "for sale by owner") and then a category (ex: "general for sale"). Once on the next "create posting" screen, don't touch anything and switch to tab 2 (Facebook Marketplace)
4. Once at Facebook Marketplace, click "+ Sell Something", choose "Item for Sale", and switch to the last tab (Letgo).
5. Once at Letgo, begin creating a post by dragging a picture on the screen, then don't touch anything.
6. Switch back to the terminal and proceed to **Run** below.

## Run
`node index.js`
Enter json found in column A of the [template spreadsheet](https://docs.google.com/spreadsheets/d/1qA4buaVGLlZG6z6O5CZx_Zw44Bm9GGpGCkL5tvgY0QA/edit?usp=sharing)

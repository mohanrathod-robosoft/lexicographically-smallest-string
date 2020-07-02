/**
 * Created by tushar on 13/09/17.
 */

'use strict'

var cheerio = require('cheerio');
var axios = require('axios');

// var URL = require('url-parse');
// var url = new URL(START_URL);

/**
 * Crawls a website using a start {url}, and returns the lexicographically smallest string.
 * @param url
 * @return {Promise.<string>}
 */

 const url = "http://localhost:8080";

module.exports = (url) => {
  return new Promise(async (resolve, reject) => {
    
    const codesArray = [];
    let pageAlreadyVisted = [];
    let tempPagesToVisit = [];
    let linkIndex = 0;

    do {
      let subLinkUrl = `${url}${pageAlreadyVisted[linkIndex] || ""}`;

      if (!pageAlreadyVisted[linkIndex] && pageAlreadyVisted.length > 0) {
        reject("Something is wrong");
        break;
      }

      let $ = await fetchHTML(subLinkUrl);

      collectWords($, codesArray);
      collectInternalLinks($, tempPagesToVisit);

      pageAlreadyVisted = [... new Set(tempPagesToVisit)];

      ++linkIndex;
    } while (pageAlreadyVisted[linkIndex]);

    let finalResult = codesArray.sort((a, b) => a.localeCompare(b))[0];
    
    resolve(finalResult);
  });
};


async function fetchHTML(url){
    let response = await axios.get(url).then((res) => res.data).catch((err) => console.log(err));

    const html = response;
    const $ = cheerio.load(html);
    return $;
}

function collectWords($, codesArray) {
  const statsCode = $('.codes').find('h1');
  statsCode.each(function() {
    let codeH1 = $(this).text();
    // console.log(codeH1, "\t");
    codesArray.push(codeH1);
  });
}

function collectInternalLinks($, tempPagesToVisit) {
    var relativeLinks = $("a[href^='/']");
    // console.log("Found " + relativeLinks.length + " relative links on page");
    relativeLinks.each(function() {
        if($(this).attr('href') !== undefined)
        tempPagesToVisit.push($(this).attr('href'));
    });
}

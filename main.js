// const axios = require('axios');
// const cheerio = require('cheerio');
// var request = require('request');
// var URL = require('url-parse');
// const url = "http://localhost:8080";
// let aLink;

// fetchData(url).then( (res) => {
//     const html = res.data;
//     const $ = cheerio.load(html);

//     const statsCode = $('.codes').find('h1');
//     statsCode.each(function() {
//         // let a = $(this).find('a').text();
//         // let newStr = a.split("\t");
//         let codeH1 = $(this).text();
//         // let newStrcodes = codeH1.split("\t");
//         console.log(codeH1, "\t");
//     });

//     aLink = $('a').attr('href');
//     console.log("aLink : " + url+""+aLink);
//     setTimeout(() => {
//         fetchData(url+""+aLink);
//     }, 1000);
    
// })
// .catch(err => console.log("err: " + err));

// async function fetchData(url){
//     console.log("Crawling data...")
//     // make http call to url
//     let response = await axios(url).catch((err) => console.log(err));

//     if(response.status !== 200){
//         console.log("Error occurred while fetching data");
//         return;
//     }
//     return response;
// }



var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');

var START_URL = "http://localhost:8080";
var MAX_PAGES_TO_VISIT = 30;

var pagesVisited = {};
var numPagesVisited = 0;
var pagesToVisit = [];
var codesArray = [];
var url = new URL(START_URL);
var baseUrl = url.protocol + "//" + url.hostname;

pagesToVisit.push(START_URL);
crawl();

function crawl() {
  // if(numPagesVisited >= MAX_PAGES_TO_VISIT) {
  //   console.log("Reached max limit of number of pages to visit.");
  //   // console.log("codesArray: " + codesArray);
  //   let unique = [... new Set(codesArray)].sort((a, b) => a.localeCompare(b))[0]; // codesArray.filter((item, i, ar) => ar.indexOf(item) === i);
  //   console.log("unique : " + unique);
  //   return;
  // }
  var nextPage = pagesToVisit.pop();
  if(nextPage === undefined) return;
  if (nextPage in pagesVisited) {
    // We've already visited this page, so repeat the crawl
    crawl();
  } else {
    // New page we haven't visited
    visitPage(nextPage, crawl);
  }
}

function visitPage(url, callback) {
  // Add page to our set
  pagesVisited[url] = true;
  numPagesVisited++;

  // Make the request
  console.log("Visiting page " + url);
  request(url, function(error, response, body) {
     // Check status code (200 is HTTP OK)
     // console.log("Status code: " + response.statusCode);
     if(response === undefined || response.statusCode !== 200) {
       callback();
       return;
     }
     // Parse the document body
     var $ = cheerio.load(body);

     const statsCode = $('.codes').find('h1');
     statsCode.each(function() {
        let codeH1 = $(this).text();
        // console.log(codeH1, "\t");
        codesArray.push(codeH1);
        // console.log("codesArray : " + codesArray);
        let unique = [... new Set(codesArray)].sort((a, b) => a.localeCompare(b))[0]; // codesArray.filter((item, i, ar) => ar.indexOf(item) === i);
        console.log("unique : " + unique);
        
     });
     collectInternalLinks($);
     
     callback();

  });
}

function collectInternalLinks($) {
    var relativeLinks = $("a[href^='/']");
    console.log("Found " + relativeLinks.length + " relative links on page");
    relativeLinks.each(function() {
        if($(this).attr('href') !== undefined)
          pagesToVisit.push(START_URL + $(this).attr('href'));
    });
}
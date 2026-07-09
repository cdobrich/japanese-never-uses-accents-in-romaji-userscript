// ==UserScript==
// @name         Correct Japanese Romanization (Macrons to Vowels)
// @namespace    https://github.com/cdobrich/japanese-never-uses-accents-in-romaji-userscript
// @version      1.0
// @description  Converts Hepburn romaji macrons (ā, ī, ū, ē, ō) into true vowel combinations (aa, ii, uu, ei, ou) on Google Translate.
// @author       Clifton Dobrich
// @match        https://translate.google.com/?sl=en&tl=ja*
// @match        https://en.wikipedia.org/wiki/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // Mapping of macron characters to their proper vowel extensions
    const romanizationMap = {
        'ā': 'aa', 'Ā': 'Aa',
        'ī': 'ii', 'Ī': 'Ii',
        'ū': 'uu', 'Ū': 'Uu',
        'ē': 'ei', 'Ē': 'Ei', // Note: Some prefer 'ee', change to 'ee' if desired
        'ō': 'ou', 'Ō': 'Ou'
    };

    const regex = new RegExp('[' + Object.keys(romanizationMap).join('') + ']', 'g');

    // Function to replace characters in a given text string
    function replaceMacrons(text) {
        return text.replace(regex, match => romanizationMap[match]);
    }

    // Recursively walk through text nodes to update them without breaking React/Google elements
    function walkAndReplace(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            const newText = replaceMacrons(node.nodeValue);
            if (newText !== node.nodeValue) {
                node.nodeValue = newText;
            }
        } else {
            // Avoid messing with input fields or textareas directly unless necessary
            if (node.tagName === 'TEXTAREA' || node.tagName === 'INPUT') return;
            
            for (let child of node.childNodes) {
                walkAndReplace(child);
            }
        }
    }

    // Set up the observer to watch for Google Translate's dynamic updates
    const observer = new MutationObserver((mutations) => {
        for (let mutation of mutations) {
            for (let addedNode of mutation.addedNodes) {
                walkAndReplace(addedNode);
            }
            // Also check the target node itself if text content changed
            if (mutation.type === 'characterData') {
                walkAndReplace(mutation.target);
            }
        }
    });

    // Start observing the entire document body for changes
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
    });

    // Run an initial pass once the page loads
    walkAndReplace(document.body);
})();

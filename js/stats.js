// Gameplay statistics
"use strict";
// globals: document, window

var SC = window.SC || {};

SC.stats = (function () {
    // Gameplay statistics
    var self = {};
    self.words = [];

    self.add = function (aWords) {
        // Add what words we found
        var i;
        for (i = 0; i < aWords.length; i++) {
            if (typeof aWords[i] === 'object') {
                self.words.push(aWords[i].label);
            } else {
                self.words.push(aWords[i]);
            }
        }
    };

    self.longest = function () {
        // return longest word
        if (self.words.length <= 0) {
            return "";
        }
        return self.words.sort(function (a, b) { return b.length - a.length; })[0];
    };

    return self;
}());


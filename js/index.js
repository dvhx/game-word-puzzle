// Main window
"use strict";
// globals: document, window, corpus

var SC = SC || {};

// prevent avoiding game over by doing refresh when game over is imminent
if (SC.storage.readBoolean('SC.started', false)) {
    SC.storage.writeNumber('SC.winsInRow', 0);
}
SC.storage.writeBoolean('SC.started', true);

SC.life = 10;
SC.next = [];
if (SC.storage.keyExists('SC.letters')) {
    SC.next = SC.storage.readString('SC.letters', 'ABCDEF').split('');
    SC.storage.erase('SC.letters');
}
SC.map = [
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '']
];

SC.reverse = function (aText) {
    // Return reversed string
    return aText.split('').reverse().join('');
};

SC.found = [];

SC.combinations = function (aPrefix, aLetter, aSuffix) {
    // Find all valid words created from prefix, letter and suffix
    var p, s, w, r, all = [];
    aPrefix = aPrefix.toLowerCase();
    aLetter = aLetter.toLowerCase();
    aSuffix = aSuffix.toLowerCase();
    for (p = 0; p < aPrefix.length + 1; p++) {
        for (s = 0; s < aSuffix.length + 1; s++) {
            w = SC.reverse(aPrefix.substr(0, p)) + aLetter + aSuffix.substr(0, s);
            r = SC.reverse(w);
            //console.log('prefix', aPrefix, 'p', p, 'suffix', aSuffix, 's', s, 'w', w, 'r', r);
            if ((w.length > 1) && (corpus.hasOwnProperty(w))) {
                SC.found.push(w);
                all.push({w: w, begin: -p, end: s});
            }
            if ((r.length > 1) && (corpus.hasOwnProperty(r))) {
                SC.found.push(r);
                all.push({r: r, begin: s, end: -p});
            }
        }
    }
    return all;
};
//SC.combinations('ohs', 't', '');  // to, hot, shot

SC.end = function (aTitle) {
    // Show ending screen
    SC.nextRender();
    window.setTimeout(function () {
        var lost = aTitle === 'Game over',
            end = document.getElementById('end'),
            endarticle = document.getElementById('endarticle'),
            endtitle = document.getElementById('endtitle'),
            endstats = document.getElementById('endstats'),
            endscore = document.getElementById('endscore'),
            endlongest = document.getElementById('endlongest'),
            endfound = document.getElementById('endfound'),
            endwir = document.getElementById('endwir'),
            winsInRow;
        if (lost) {
            SC.storage.writeNumber('SC.winsInRow', 0);
            winsInRow = 0;
        } else {
            winsInRow = SC.storage.inc('SC.winsInRow');
        }
        SC.storage.writeBoolean('SC.started', false);
        endarticle.style.backgroundColor = lost ? '#fa7' : '#7af';
        endtitle.textContent = aTitle;
        endstats.style.display = lost ? 'none' : 'block';
        endscore.textContent = SC.life;
        endlongest.textContent = SC.stats.longest().toUpperCase();
        endfound.textContent = SC.stats.words.length;
        endwir.textContent = winsInRow;
        end.style.display = 'flex';
        document.getElementById('play').onclick = function () {
            document.location.reload();
        };
    }, 500);
};

SC.nextRender = function () {
    // Render next characters and life
    document.getElementById('next0').textContent = SC.next[0];
    document.getElementById('next1').textContent = SC.next[1];
    document.getElementById('next2').textContent = SC.next[2];
    document.getElementById('next3').textContent = SC.next[3];
    document.getElementById('next4').textContent = SC.next[4];
    document.getElementById('next5').textContent = SC.next[5];
    document.getElementById('life').textContent = SC.life > 0 ? SC.life : 0;
};

SC.randomCharacter = function () {
    // Return random character, ranges calculated from data found at http://en.wikipedia.org/wiki/Letter_frequency
    var percent = {
            a: 8.167,
            b: 1.492,
            c: 2.782,
            d: 4.253,
            e: 12.702,
            f: 2.228,
            g: 2.015,
            h: 6.094,
            i: 6.966,
            j: 0.153,
            k: 0.772,
            l: 4.025,
            m: 2.406,
            n: 6.749,
            o: 7.507,
            p: 1.929,
            q: 0.095,
            r: 5.987,
            s: 6.327,
            t: 9.056,
            u: 2.758,
            v: 0.978,
            w: 2.360,
            x: 0.150,
            y: 1.974,
            z: 0.074
        },
        c,
        s = 0,
        sum = [],
        i,
        r;
    for (c in percent) {
        if (percent.hasOwnProperty(c)) {
            sum.push(s);
            s += percent[c];
        }
    }
    sum.push(101);
    //console.log(s, sum);
    r = Math.random() * s;
    for (i = 0; i < sum.length; i++) {
        if (r >= sum[i] && r < sum[i + 1]) {
            return String.fromCharCode(65 + i);
        }
    }
};

// initialize next array
SC.next.push(SC.randomCharacter());
SC.next.push(SC.randomCharacter());
SC.next.push(SC.randomCharacter());
SC.next.push(SC.randomCharacter());
SC.next.push(SC.randomCharacter());
SC.next.push(SC.randomCharacter());

SC.charAt = function (x, y) {
    // return chart at given map position or empty string if empty or out of map
    if (y >= 0 && y < SC.map.length && x >= 0 && x < SC.map[0].length) {
        return SC.map[y][x];
    }
    return '';
};

SC.onClickTd = function (event) {
    // Handle click on table cell
    var td = event.target, c, bg,
        x = parseInt(event.target.getAttribute('x'), 10),
        y = parseInt(event.target.getAttribute('y'), 10),
        i,
        a,
        arrows = [],
        p, pc, pend,
        s, sc, send;
    if (SC.life <= 0) {
        return;
    }
    bg = document.getElementById('bg_' + y + '_' + x);

    // flash background
    window.setTimeout(function () {
        bg.style.backgroundColor = '';
    }, 500);
    if (bg.textContent.trim() !== '') {
        bg.style.backgroundColor = 'red';
        return;
    }
    bg.style.backgroundColor = 'skyblue';

    // place character
    c = SC.next.shift();
    SC.next.push(SC.randomCharacter());
    SC.map[y][x] = c;
    bg.textContent = c;

    SC.found = [];

    // find horizontal
    p = '';
    s = '';
    pend = false;
    send = false;
    for (i = 1; i < SC.map.length; i++) {
        if (!pend) {
            pc = SC.charAt(x - i, y);
            p += pc;
            if (pc === '') {
                pend = true;
            }
        }
        if (!send) {
            sc = SC.charAt(x + i, y);
            s += sc;
            if (sc === '') {
                send = true;
            }
        }
    }
    //console.log('h p', p, 'c', c, 's', s);
    a = SC.combinations(p, c, s);

    // arrows
    for (i = 0; i < a.length; i++) {
        if (a[i].w) {
            arrows.push({x1: a[i].begin, y1: 0, x2: a[i].end, y2: 0, label: a[i].w});
        } else {
            arrows.push({x1: a[i].begin, y1: 0, x2: a[i].end, y2: 0, label: a[i].r});
        }
    }

    // find vertical
    p = '';
    s = '';
    pend = false;
    send = false;
    for (i = 1; i < SC.map.length; i++) {
        if (!pend) {
            pc = SC.charAt(x, y - i);
            p += pc;
            if (pc === '') {
                pend = true;
            }
        }
        if (!send) {
            sc = SC.charAt(x, y + i);
            s += sc;
            if (sc === '') {
                send = true;
            }
        }
    }
    //console.log('v p', p, 'c', c, 's', s);
    a = SC.combinations(p, c, s);

    // arrows
    for (i = 0; i < a.length; i++) {
        if (a[i].w) {
            arrows.push({x1: 0, y1: a[i].begin, x2: 0, y2: a[i].end, label: a[i].w});
        } else {
            arrows.push({x1: 0, y1: a[i].begin, x2: 0, y2: a[i].end, label: a[i].r});
        }
    }

    // render arrows
    if (arrows.length > 0) {
        window.setTimeout(function () {
            SC.arrows.arrows(td, arrows);
        }, 300);
    }
    SC.stats.add(arrows);

    // update life
    SC.life = SC.life - 1 + SC.found.length;
    SC.nextRender();

    // test for game end
    if (SC.life <= 0) {
        SC.end('Game over');
        return;
    }
    if (SC.map.join('').replace(/[,]+/g, '').length >= 49) {
        SC.end('Completed');
        return;
    }
};

// initialize window
window.addEventListener('DOMContentLoaded', function () {
    // show intro
    document.getElementById('intro').style.display = 'flex';
    document.getElementById('playfromintro').addEventListener('click', function () {
        document.getElementById('intro').style.display = 'none';
    });

    SC.nextRender();
    var i, td = document.getElementsByTagName('td');
    for (i = 0; i < td.length; i++) {
        td[i].addEventListener('click', SC.onClickTd);
    }
});


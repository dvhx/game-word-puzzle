// Drawing animated arrows over the table cells
"use strict";
// globals: document, window

var SC = window.SC || {};

SC.arrows = (function () {
    // Drawing animated arrows over the table cells
    var self = {}, canvas, context;

    function resize() {
        // Canvas resize
        canvas = document.getElementById('canvas');
        context = canvas.getContext('2d');
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
    }
    window.addEventListener('resize', resize);
    window.addEventListener('DOMContentLoaded', resize);

    function text(aLabel, aX, aY, aAlign, aBaseline) {
        // Draw text label
        context.textBaseLine = aBaseline || 'bottom';
        context.textAlign = aAlign || 'center';
        context.fillStyle = 'green';
        context.strokeStyle = 'white';
        context.lineWidth = 3;
        context.strokeText(aLabel.toUpperCase(), aX, aY);
        context.fillText(aLabel.toUpperCase(), aX, aY);
    }

    self.arrow = function (aTd, aX1, aY1, aX2, aY2, aLabel) {
        // Draw arrow relative from td
        //console.log('SC.arrows.arrow', aTd, aX1, aY1, aX2, aY2);
        var rect = aTd.getClientRects()[0], t = Math.round(0.2 * (rect.width + rect.height) / 2);
        rect.cx = rect.left + rect.width / 2;
        rect.cy = rect.top + rect.height / 2;
        context.font = '0.5cm sans-serif';
        context.strokeStyle = 'rgba(0,127,0,0.5)';
        context.lineWidth = 5;
        context.lineCap = 'round';
        context.beginPath();
        context.moveTo(rect.cx + aX1 * rect.width, rect.cy + aY1 * rect.height);
        context.lineTo(rect.cx + aX2 * rect.width, rect.cy + aY2 * rect.height);

        if (aX1 === aX2) {
            if (aY1 > aY2) {
                context.moveTo(rect.cx + aX2 * rect.width - t, rect.cy + aY2 * rect.height + t);
                context.lineTo(rect.cx + aX2 * rect.width, rect.cy + aY2 * rect.height);
                context.lineTo(rect.cx + aX2 * rect.width + t, rect.cy + aY2 * rect.height + t);
            } else {
                context.moveTo(rect.cx + aX2 * rect.width - t, rect.cy + aY2 * rect.height - t);
                context.lineTo(rect.cx + aX2 * rect.width, rect.cy + aY2 * rect.height);
                context.lineTo(rect.cx + aX2 * rect.width + t, rect.cy + aY2 * rect.height - t);
            }
            if (rect.cx > 0.7 * canvas.width) {
                text(aLabel.toUpperCase(), rect.cx - rect.width / 3, rect.cy + (aY1 + aY2) * rect.height / 2, 'right', 'middle');
            } else {
                text(aLabel.toUpperCase(), rect.cx + rect.width / 3, rect.cy + (aY1 + aY2) * rect.height / 2, 'left', 'middle');
            }
        } else {
            if (aX1 > aX2) {
                context.moveTo(rect.cx + aX2 * rect.width + t, rect.cy + aY2 * rect.height + t);
                context.lineTo(rect.cx + aX2 * rect.width, rect.cy + aY2 * rect.height);
                context.lineTo(rect.cx + aX2 * rect.width + t, rect.cy + aY2 * rect.height - t);
            } else {
                context.moveTo(rect.cx + aX2 * rect.width - t, rect.cy + aY2 * rect.height - t);
                context.lineTo(rect.cx + aX2 * rect.width, rect.cy + aY2 * rect.height);
                context.lineTo(rect.cx + aX2 * rect.width - t, rect.cy + aY2 * rect.height + t);
            }
            text(aLabel.toUpperCase(), rect.cx + (aX1 + aX2) * rect.width / 2, rect.cy - rect.height / 3, 'center', 'bottom');
        }
        //context.lineTo(rect.cx + aX2 * rect.width, rect.cy + aY2 * rect.height);
        //context.closePath();
        context.strokeStyle = 'green';
        context.stroke();
        //context.fill();
    };

    self.arrows = function (aTd, aArrows) {
        // Draw multiple arrows sequentially
        var first = aArrows.shift();
        //console.log('f', aTd, first.x1, first.y1, first.x2, first.y2, first.label);
        canvas.style.display = 'block';
        resize();
        self.arrow(aTd, first.x1, first.y1, first.x2, first.y2, first.label);
        if (aArrows.length > 0) {
            window.setTimeout(function () {
                context.clearRect(0, 0, canvas.width, canvas.height);
            }, 700);
            window.setTimeout(function () {
                self.arrows(aTd, aArrows);
            }, 1000);
        } else {
            window.setTimeout(function () {
                canvas.style.display = 'none';
            }, 1000);
        }
    };

    return self;
}());


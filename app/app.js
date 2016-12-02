'use strict';

require('styles/screen-16x10.css');
require('highlightjs/styles/default.css');
require('styles/custom.css');

require('imports?this=>global&exports=>false!shower-core');

let hl = require('highlightjs');
hl.initHighlighting();

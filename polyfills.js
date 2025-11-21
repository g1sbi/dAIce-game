import { Buffer } from 'buffer';
import { EventEmitter } from 'events';

global.Buffer = Buffer;
global.process = require('process');

if (typeof global.EventEmitter === 'undefined') {
  global.EventEmitter = EventEmitter;
}


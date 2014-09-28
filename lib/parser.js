// Main perser class

'use strict';


var assign = require('object-assign');


var Renderer    = require('./renderer');
var LexerBlock  = require('./lexer_block');
var LexerInline = require('./lexer_inline');
var defaults    = require('./defaults');

// Main class
//
function Parser(options) {
  this.options  = assign({}, defaults);
  this.state    = null;

  this.inline   = new LexerInline();
  this.block    = new LexerBlock();
  this.renderer = new Renderer();

  // a bunch of cross-references between parsers
  // used for link reference definitions
  this.block.inline = this.inline;

  if (options) { this.set(options); }
}


Parser.prototype.set = function (options) {
  assign(this.options, options);
};


Parser.prototype.render = function (src) {
  var tokens, tok, i, l, env = { references: Object.create(null) };

  // Parse blocks
  tokens = this.block.parse(src, this.options, env);

  // Parse inlines
  for (i = 0, l = tokens.length; i < l; i++) {
    tok = tokens[i];
    if (tok.type === 'inline') {
      tok.children = this.inline.parse(tok.content, this.options, env);
    }
  }

  // Render
  return this.renderer.render(tokens, this.options, env);
};


module.exports = Parser;
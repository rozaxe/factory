
/**
 * The Factory class requires {@link https://olado.github.io/doT}
 * @requires doT.js
 */

// Factory configurations

/**
 * Store all badge's styles
 * @constant {string[]}
 */
STYLENAMES = ['flat', 'flat-square', 'plastic', 'for-the-badge', 'social']

/**
 * Base path to download template
 * @constant {string}
 */
BASE_PATH = 'templates/'

/**
 * Templates suffix
 * @constant {string}
 */
SUFFIX = '-template.svg'


// Do not touch below

var canvas = document.createElement('canvas')
var context = canvas.getContext('2d')
context.font = '11px Verdana, "DejaVu Sans"'

/**
 * Factory class for building badge
 * @constructor
 * @public
 */
Factory = function() {
	
	/** @private */
	this.count = 0
	
	/** @private */
	this.templates = {}

}

/**
 * Download all templates
 * @param {function} callback - Callback when templates are all downloaded
 */
Factory.prototype.downloadAll = function(callback) {

	// For each name
	STYLENAMES.forEach(function(name) {

			// Path to template
			var path = BASE_PATH + name + SUFFIX

			// Keep scope
			var that = this

			// AJAX
			var r = new XMLHttpRequest()
			r.open('GET', path, true)
			r.onreadystatechange = function () {
				if (r.readyState != 4 || r.status != 200) return

				// Compile with doT
				var t = doT.template(r.responseText)

				// Save it for later
				that.templates[name] = t

				// Template downloaded
				++that.count

				// Callback if ready
				if (that.ready()) {
					callback()
				}
			}
			r.send()

		}, this)
}

/**
 * Check if templates are ready to use
 * @return {boolean}
 */
Factory.prototype.ready = function() {
	return this.count === STYLENAMES.length
}

/**
 * Compile template to HTML
 * @param {string} style - One of the stylenames
 * @param {string} subject - The badge subject
 * @param {string} value - The badge value
 * @paran {string} color - The badge's value color
 * @return {string} - HTML based on template
 */
Factory.prototype.compileBadge = function(style, subject, value, color) {

	var sty = style
	var func = this.templates[sty]
	var sub = subject.replace(/_/g, ' ')
	var val = value.replace(/_/g, ' ')
	
	var subjectWidth = getCanvasSize(subject) + 10
	var valueWidth = getCanvasSize(value) + 10
	
	var html = func({colorB: color, widths: [subjectWidth, valueWidth], text: [sub, val], escapeXml: escapeXml, capitalize: capitalize, links: '', logoWidth: 0, logoPadding: 0})

	return html
}

function getCanvasSize(text) {
	return Math.ceil(context.measureText(text).width)
}

function escapeXml(s) {
	return s.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
		    .replace(/'/g, '&apos;')
}

function capitalize(s) {
	return s[0].toUpperCase() + s.slice(1)
}



// Path to colorscheme file
COLORS_PATH = 'colorscheme.json'

// Main
window.onload = function() {

	// Store DOM Object
	window.dom = {}

	// DOM Access
	dom.render = document.querySelector('#render')
	dom.copy = document.querySelector('#copy')
		
	// Factory object
	var factory = new Factory()
	
	// Get Input
	dom.subject = document.querySelector('#subject')
	dom.value = document.querySelector('#value')
	dom.styles = document.querySelector('#stylenames')
	dom.colors = document.querySelector('#colors')
	dom.custom = document.querySelector('#custom')
	dom.c_custom = document.querySelector('#c_custom')
	
	// Link to function
	dom.subject.oninput = newInput
	dom.value.oninput   = newInput
	
	// Auto select for copying
	dom.copy.onclick = function() {
		this.select()
	}

	// Download all styles
	factory.downloadAll(afterDownload)
	
	// Download colorscheme
	downloadColorscheme(buildColorsForm)

	/*
	 * Functions
	 */

	function sanitize(s) {
		return s.replace(/-/g, '').replace(/ /g, '_')
	}
	 
	function getSubject() {
		return sanitize(dom.subject.value || 'subject')
	}
	
	function getValue() {
		return sanitize(dom.value.value || 'value')
	}
	
	function getStyle() {
		var el = dom.styles.querySelector(':checked')
		if (el) {
			return el.value
		} else {
			return 'flat'
		}
	}
	
	function getColor() {
		var el = dom.colors.querySelector(':checked')
		if (el) {
				
			if (el.value == 'custom') {
				// Custom color
				if (dom.custom.value[0] == '#') {
					return dom.custom.value
				} else {
					return '#' + dom.custom.value
				}
			} else {			
				// Colorscheme
				return el.value	
			}
			
		} else {
			// No color
			return null
		}
	}
	
	function getColorName() {
		var el = dom.colors.querySelector(':checked')
		if (el) {
			return el.dataset.colorname
		} else {
			return null
		}
	}
	
	// Compile badge and show it to user	
	function updateBadge() {
		
		if (!factory.ready()) return
		
		// Get SVG
		var style = getStyle()
		var subject = getSubject()
		var value = getValue()
		var color = getColor()
		var colorname = getColorName() || '0'
		
		var html = factory.compileBadge(style, subject, value, color)
		dom.render.innerHTML = html
		
		// Update link
		var link = ''
		link = '![' + subject + ' ' + value + '](https://img.shields.io/badge/' + subject + '-' + value + '-'+ colorname + '.svg'
		if (style != 'flat') {
			// Not default style
			link += '?style=' + style
		}
		link += ')' // Don't forget to close tag
		dom.copy.value = link

	}
	
	// After download
	function afterDownload() {
		buildStylesForm()
		
		// Show badge style input
		for (var i in STYLENAMES) {
			var svg = factory.compileBadge(STYLENAMES[i], 'subject', 'value', '#4c1')

			// Show style
			document.querySelector('#b_' + STYLENAMES[i]).src = 'data:image/svg+xml;charset=utf-8,' + svg
		}
		
		// Update badge
		updateBadge()
	}
	
	// Input event handler
	function newInput() {
		updateBadge()
	}
	
	// Download color scheme
	function downloadColorscheme(callback) {
		
		var r = new XMLHttpRequest()
		r.open('GET', COLORS_PATH, true)
		r.onreadystatechange = function () {
			if (r.readyState != 4 || r.status != 200) return

			// Parse colorscheme data
			var colors = JSON.parse(r.responseText)
			
			// Delete synonyme and basic gray
			delete colors.grey
			delete colors.gray
			delete colors.lightgrey
			
			// Callback with data
			callback(colors)

		}
		r.send()

	}
	
	// Build styles radio input
	function buildStylesForm() {
		// Get template
		var node = document.querySelector('#t_style')
		
		// Compile template
		var template = doT.template(node.innerHTML)
		
		// Generate html from template
		var html = template(STYLENAMES)
		
		// Replace template script with html
		node.parentNode.innerHTML = html
		
		// Link click event
		var children = dom.styles.childNodes
		for (var i = 0 ; i < children.length ; ++i) {
			children[i].onclick = updateBadge
		}
		
		updateBadge()
	}
	
	
	// Build color radio input
	function buildColorsForm(colors) {
		var node = document.querySelector('#t_color')
		
		var template = doT.template(node.innerHTML)
		
		var html = template(colors)
		
		node.parentNode.innerHTML = html
		
		var children = dom.colors.childNodes
		for (var i = 0 ; i < children.length ; ++i) {
			children[i].onclick = updateBadge
		}
		
		var cb = function() {
			dom.c_custom.checked = true
			if (dom.custom.value[0] == '#') {
				dom.c_custom.dataset.colorname = dom.custom.value.substr(1)				
			} else {
				dom.c_custom.dataset.colorname = dom.custom.value
			}

			updateBadge()
		}
		
		// Link custom input
		dom.custom.oninput = cb
		dom.custom.onfocus = cb
		
		updateBadge()
	}

}

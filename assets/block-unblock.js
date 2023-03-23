// variable.js part
const TYPE_ATTRIBUTE = 'javascript/blocked'

const patterns = {
  blacklist: window.YETT_BLACKLIST,
  whitelist: window.YETT_WHITELIST
}

// Backup list containing the original blacklisted script elements
const backupScripts = {
  blacklisted: []
}

//check.js part 


const isOnBlacklist = (src, type) => (
  src &&
  (!type || type !== TYPE_ATTRIBUTE) &&
  (
    (!patterns.blacklist || patterns.blacklist.some(pattern => pattern.test(src))) &&
    (!patterns.whitelist || patterns.whitelist.every(pattern => !pattern.test(src)))
  )
)

const willBeUnblocked = function(script) {
  const src = script.getAttribute('src')
  return (
    patterns.blacklist && patterns.blacklist.every(entry => !entry.test(src)) ||
    patterns.whitelist && patterns.whitelist.some(entry => entry.test(src))
  )
}

//Observer js part //


// Setup a mutation observer to track DOM insertion
const observer = new MutationObserver(mutations => {
  for (let i = 0; i < mutations.length; i++) {
    const { addedNodes } = mutations[i];
    for(let i = 0; i < addedNodes.length; i++) {
      const node = addedNodes[i]
      // For each added script tag
      if(node.nodeType === 1 && node.tagName === 'SCRIPT') {
        const src = node.src
        const type = node.type
        // If the src is inside the blacklist and is not inside the whitelist
      
        if(isOnBlacklist(src, type)) {
          // We backup the node
          backupScripts.blacklisted.push([node, node.type])

          // Blocks inline script execution in Safari & Chrome
          node.type = TYPE_ATTRIBUTE
          
          // Firefox has this additional event which prevents scripts from beeing executed
          const beforeScriptExecuteListener = function (event) {
            // Prevent only marked scripts from executing
            if(node.getAttribute('type') === TYPE_ATTRIBUTE)
              event.preventDefault()
              node.removeEventListener('beforescriptexecute', beforeScriptExecuteListener)
          }
          node.addEventListener('beforescriptexecute', beforeScriptExecuteListener)

          // Remove the node from the DOM
          node.parentElement && node.parentElement.removeChild(node)
        }
      }
    }
  }
})

// Starts the monitoring
observer.observe(document.documentElement, {
  childList: true,
  subtree: true
})

//monkey.js part 


const createElementBackup = document.createElement

const originalDescriptors = {
  src: Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src'),
  type: Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'type')
}

// Monkey patch the createElement method to prevent dynamic scripts from executing
document.createElement = function(...args) {
  // If this is not a script tag, bypass
  if(args[0].toLowerCase() !== 'script')
    return createElementBackup.bind(document)(...args)

    const scriptElt = createElementBackup.bind(document)(...args)

    // Define getters / setters to ensure that the script type is properly set
    try {
      Object.defineProperties(scriptElt, {
        'src': {
          ...originalDescriptors.src,
          set(value) {
          if(isOnBlacklist(value, scriptElt.type)) {
          originalDescriptors.type.set.call(this, TYPE_ATTRIBUTE)
        }
        originalDescriptors.src.set.call(this, value)
      }
                              },
                              'type': {
                              ...originalDescriptors.type,
                              get() {
        const typeValue = originalDescriptors.type.get.call(this);
        if(typeValue === TYPE_ATTRIBUTE || isOnBlacklist(this.src, typeValue)) {
          // Prevent script execution.
          return null
        }
        return typeValue
      },
        set(value) {
          const typeValue = isOnBlacklist(scriptElt.src, scriptElt.type) ? TYPE_ATTRIBUTE : value
          originalDescriptors.type.set.call(this, typeValue)
        }
    }
})

// Monkey patch the setAttribute function so that the setter is called instead
scriptElt.setAttribute = function(name, value) {
  if(name === 'type' || name === 'src')
    scriptElt[name] = value
    else
      HTMLScriptElement.prototype.setAttribute.call(scriptElt, name, value)
      }
} catch (error) {
  // eslint-disable-next-line
  console.warn(
    'Yett: unable to prevent script execution for script src ', scriptElt.src, '.\n',
    'A likely cause would be because you are using a third-party browser extension that monkey patches the "document.createElement" function.'
  )
}
return scriptElt
}

// unblock js part

      const URL_REPLACER_REGEXP = new RegExp('[|\\{}()[\\]^$+*?.]', 'g')

      // Unblocks all (or a selection of) blacklisted scripts.
      const unblock_script = function(...scriptUrlsOrRegexes) {
        if(scriptUrlsOrRegexes.length < 1) {
          patterns.blacklist = []
          patterns.whitelist = []
        } else {
          if(patterns.blacklist) {
            patterns.blacklist = patterns.blacklist.filter(pattern => (
              scriptUrlsOrRegexes.every(urlOrRegexp => {
                if(typeof urlOrRegexp === 'string')
                  return !pattern.test(urlOrRegexp)
                  else if(urlOrRegexp instanceof RegExp)
                    return pattern.toString() !== urlOrRegexp.toString()
                    })
            ))
          }
          if(patterns.whitelist) {
            patterns.whitelist = [
              ...patterns.whitelist,
              ...scriptUrlsOrRegexes
              .map(urlOrRegexp => {
                if(typeof urlOrRegexp === 'string') {
                  const escapedUrl = urlOrRegexp.replace(URL_REPLACER_REGEXP, '\\$&')
                  const permissiveRegexp = '.*' + escapedUrl + '.*'
                  if(patterns.whitelist.every(p => p.toString() !== permissiveRegexp.toString())) {
                    return new RegExp(permissiveRegexp)
                  }
                } else if(urlOrRegexp instanceof RegExp) {
                  if(patterns.whitelist.every(p => p.toString() !== urlOrRegexp.toString())) {
                    return urlOrRegexp
                  }
                }
                return null
              })
              .filter(Boolean)
            ]
          }
        }


        // Parse existing script tags with a marked type
        const tags = document.querySelectorAll(`script[type="${TYPE_ATTRIBUTE}"]`)
        for(let i = 0; i < tags.length; i++) {
          const script = tags[i]
          if(willBeUnblocked(script)) {
            backupScripts.blacklisted.push([script, 'application/javascript'])
            script.parentElement.removeChild(script)
          }
        }

        // Exclude 'whitelisted' scripts from the blacklist and append them to <head>
        let indexOffset = 0;
        [...backupScripts.blacklisted].forEach(([script, type], index) => {
          if(willBeUnblocked(script)) {
            const scriptNode = document.createElement('script')
            for(let i = 0; i < script.attributes.length; i++) {
              let attribute = script.attributes[i]
              if(attribute.name !== 'src' && attribute.name !== 'type') {
                scriptNode.setAttribute(attribute.name, script.attributes[i].value)
              }
            }
            scriptNode.setAttribute('src', script.src)
            scriptNode.setAttribute('type', type || 'application/javascript')
            document.head.appendChild(scriptNode)
            backupScripts.blacklisted.splice(index - indexOffset, 1)
            indexOffset++
          }
        })

        // Disconnect the observer if the blacklist is empty for performance reasons
        if(patterns.blacklist && patterns.blacklist.length < 1) {
          observer.disconnect()
        }
      }

import re

with open('app.js', 'r') as f:
    app_js = f.read()

# Add translation keys for tabs
if 'navDashboard' not in app_js:
    app_js = app_js.replace(
        "titleBrand: 'YASLOGIST INTEL',",
        "titleBrand: 'YASLOGIST INTEL',\n        navDashboard: 'DASHBOARD',\n        navThreatMap: 'THREAT MAP',\n        navIntelWire: 'INTEL WIRE',\n        navCveMatrix: 'CVE MATRIX',\n        navAptDossiers: 'APT DOSSIERS',"
    )
    app_js = app_js.replace(
        "titleBrand: 'استخبارات ياسلوجست',",
        "titleBrand: 'استخبارات ياسلوجست',\n        navDashboard: 'لوحة القيادة',\n        navThreatMap: 'خريطة التهديدات',\n        navIntelWire: 'شريط الاستخبارات',\n        navCveMatrix: 'مصفوفة الثغرات',\n        navAptDossiers: 'ملفات المجموعات',"
    )

# Add bindTabs()
bind_tabs_code = """
    bindTabs() {
        const tabs = document.querySelectorAll('.nav-tab');
        const panes = document.querySelectorAll('.tab-pane');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                panes.forEach(p => p.classList.remove('active'));
                
                tab.classList.add('active');
                const targetId = tab.getAttribute('data-target');
                const targetPane = document.getElementById(targetId);
                if (targetPane) {
                    targetPane.classList.add('active');
                    if (targetId === 'threat-map-view' && this.threatMap && this.threatMap.map) {
                        setTimeout(() => {
                            this.threatMap.map.invalidateSize();
                        }, 100);
                    }
                }
            });
        });
    }
"""

if 'bindTabs()' not in app_js:
    app_js = app_js.replace('bindInteractions() {', bind_tabs_code + '\n    bindInteractions() {')
    app_js = app_js.replace('this.bindInteractions();', 'this.bindTabs();\n        this.bindInteractions();')

# Update DOM-traversal function to recursively update text nodes
# Wait, currently applyTranslations() uses textContent on data-i18n which replaces child nodes.
# Let's rewrite applyTranslations() to be a robust DOM-traversal function.
traversal_func = """
    applyTranslations() {
        const dict = I18N[this.currentLang];
        
        // Traverse all text nodes and update them if they match a key
        const walkDOM = (node) => {
            if (node.nodeType === 1) { // Element node
                const key = node.getAttribute('data-i18n');
                if (key && dict[key]) {
                    // Update text content without removing child elements (like icons)
                    // if there are no child elements. If there are, replace the text node specifically.
                    // Instead of full textContent replacement, we replace text nodes.
                    let foundText = false;
                    for (let child of node.childNodes) {
                        if (child.nodeType === 3 && child.nodeValue.trim().length > 0) {
                            child.nodeValue = dict[key];
                            foundText = true;
                            break; // Update first text node
                        }
                    }
                    if (!foundText && node.childNodes.length === 0) {
                        node.textContent = dict[key];
                    }
                }
                
                const phKey = node.getAttribute('data-i18n-placeholder');
                if (phKey && dict[phKey]) {
                    node.placeholder = dict[phKey];
                }
                
                node.childNodes.forEach(walkDOM);
            }
        };
        walkDOM(document.body);
    }
"""
app_js = re.sub(r'    applyTranslations\(\) \{.*?(?=\n    async loadData)', traversal_func.strip('\n'), app_js, flags=re.DOTALL)

with open('app.js', 'w') as f:
    f.write(app_js)


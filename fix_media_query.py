import re

with open('styles.css', 'r', encoding='utf-8') as f:
    css = f.read()

# find @media (max-width: 860px) { ... } and fix the .command-header inside it
css = css.replace("""@media (max-width: 860px) {
    .command-header {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 24px;
    padding: 14px 22px;
    background: rgba(10, 13, 20, 0.3);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.command-header:hover {
    background: rgba(10, 13, 20, 0.45);
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5), 0 0 20px rgba(234, 179, 8, 0.1);
}""", """@media (max-width: 860px) {
    .command-header {
        grid-template-columns: 1fr;
        gap: 16px;
    }""")

with open('styles.css', 'w', encoding='utf-8') as f:
    f.write(css)


#!/usr/bin/env bash
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/.." && pwd)"

# Build paid product archives for verification, but do not publish them as static assets.
bash "$ROOT/tools/build-products.sh"
test -s "$ROOT/public/products/remote-career-diy.zip"
test -s "$ROOT/public/products/ai-project-handoff.zip"
test -s "$ROOT/public/products/lnc-expanded.zip"

rm -rf "$HERE/dist"
mkdir -p "$HERE/dist"
cp -a "$ROOT/public/." "$HERE/dist/"
rm -rf "$HERE/dist/products"

cat > "$HERE/dist/config.js" <<'EOF'
window.FOUR_OFFER_CONFIG={
  sellerEmail:"",
  analyticsUrl:"/api/analytics",
  deliveryUrl:"/api/delivery",
  paypalApiReady:false,
  paypalEnvironment:"disabled",
  paypalLinks:{}
};
EOF

cat > "$HERE/dist/preview-guard.js" <<'EOF'
document.addEventListener("DOMContentLoaded",()=>{
  document.querySelectorAll(".buy").forEach(btn=>{
    const clone=btn.cloneNode(true);
    clone.textContent="Preview only — checkout disabled";
    clone.removeAttribute("href");
    clone.classList.add("disabled");
    clone.classList.remove("primary");
    clone.addEventListener("click",e=>e.preventDefault());
    btn.replaceWith(clone);
  });
});
EOF

python - <<'PY'
from pathlib import Path
p=Path("dist/index.html")
s=p.read_text()
s=s.replace('src="/config.js"','src="./config.js"')
s=s.replace('</body>','<script src="./preview-guard.js"></script></body>')
p.write_text(s)
PY

test -f "$HERE/dist/index.html"
test -f "$HERE/dist/config.js"
test ! -e "$HERE/dist/products/remote-career-diy.zip"

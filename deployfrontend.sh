cp -r src/ docs/
cp build/contracts/* docs/
git add .
git commit -m "Compiles assets for GitHub Pages"
git push -u origin2 master
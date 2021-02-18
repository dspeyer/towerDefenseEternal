#!/bin/bash

echo 'window.imageData = {};' > imageData.js

cd images
for i in *.png; do (echo window.imageData.; echo $i | sed 's/.png//'; echo " = '"; base64 <$i; echo "';") | tr -d '\n'; echo;done  >> ../imageData.js
cd ..

cat index.html  | egrep '<html|<head|<title|<meta'  > bundled.html

for i in `cat index.html  | grep 'script src' | sed 's/.*src="//' | sed 's/".*//'`; do
    echo "<script>" >> bundled.html
    cat $i >> bundled.html
    echo "</script>" >> bundled.html
done

cat index.html  | egrep -v '<html|<head|<title|<meta|script src' >> bundled.html

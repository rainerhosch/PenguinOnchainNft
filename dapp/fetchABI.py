import urllib.request
import re
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req = urllib.request.Request(
    'https://sepolia.etherscan.io/address/0x61b3f2011a92d183c7dbadbda940a7555ccf9227#code',
    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
)

html = urllib.request.urlopen(req, context=ctx).read().decode('utf-8')

# Etherscan stores ABI in a variable or inside a pre tag
match = re.search(r"var\s+abi\s*=\s*'(.*?)';", html)
if match:
    # It's usually JS escaped
    abi_str = match.group(1)
    # unescape
    abi_str = abi_str.encode('utf-8').decode('unicode_escape')
    print("Found ABI length:", len(abi_str))
    
    with open('quoter_abi_sepolia.json', 'w') as f:
        f.write(abi_str)
else:
    match2 = re.search(r"<pre[^>]*id='js-copytextarea2'[^>]*>(.*?)</pre>", html, re.DOTALL)
    if match2:
        abi_str = match2.group(1)
        import html as ht
        abi_str = ht.unescape(abi_str)
        print("Found ABI in pre length:", len(abi_str))
        with open('quoter_abi_sepolia.json', 'w') as f:
            f.write(abi_str)
    else:
        print("ABI not found")

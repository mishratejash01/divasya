# Deity artwork — provenance

Every file here must be public domain or otherwise cleared for commercial use.
Record the source and licence before adding one.

Every licence below was confirmed through the Commons API
(`extmetadata.LicenseShortName`) **before** the file was downloaded — the
fetch script skips anything that does not report public domain.

The Raja Ravi Varma works are public domain by age: he died in 1906.

Files are fetched at ~400–500px via the API's `iiurlwidth`, not at full size.
These render at 24–48px, and the Hanuman original is 4106×5712 / 7 MB.

| File | Source | Licence | Work |
|---|---|---|---|
| `ganesha.jpg` | [Commons](https://commons.wikimedia.org/wiki/File:Sri_Mangalmurthy.jpg) | Public domain | Sri Mangalmurthy |
| `krishna.jpg` | [Commons](https://commons.wikimedia.org/wiki/File%3ARaja_Ravi_Varma%2C_Yasodha_and_Krishna_%281901%29.jpg) | Public domain | Raja Ravi Varma, Yasodha and Krishna (1901) |
| `shiva.jpg` | [Commons](https://commons.wikimedia.org/wiki/File%3ASiva-parvati-by-raja-ravi-varma.jpg) | Public domain | Raja Ravi Varma, Siva and Parvati |
| `hanuman.jpg` | [Commons](https://commons.wikimedia.org/wiki/File%3ARamapanchayan%2C_Raja_Ravi_Varma_%28Lithograph%29.jpg) | Public domain | Raja Ravi Varma, Ramapanchayan (lithograph) |
| `durga.jpg` | [Commons](https://commons.wikimedia.org/wiki/File%3ADurga_by_Raja_Ravi_Varma.jpg) | Public domain | Raja Ravi Varma, Durga |
| `lakshmi.jpg` | [Commons](https://commons.wikimedia.org/wiki/File%3ARaja_Ravi_Varma%2C_Goddess_Lakshmi%2C_1896.jpg) | Public domain | Raja Ravi Varma, Goddess Lakshmi (1896) |

Rendered by `<DeityPortrait/>` in `components/ui.tsx`, which falls back to the
drawn `IconGanesha` mark if a file is missing, so the frame is never empty and
never shows a broken-image icon.

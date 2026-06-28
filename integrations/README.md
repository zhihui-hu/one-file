# Integrations

## GioPic

`giopic-onefile-uploader.json` is a GioPic uploader plugin. Import it in GioPic's plugin page, then add OneFile as an upload target.

Recommended setup:

1. In OneFile, create a file API key with `uploads:write` and bind it to the bucket you want to use.
2. Make sure the bucket has a valid `Public URL`, otherwise GioPic cannot receive a usable image link.
3. In GioPic, import `giopic-onefile-uploader.json`.
4. Configure:
   - `OneFile URL`: your OneFile site origin, for example `https://onefile.example.com`
   - `Upload Mode`: `API Key`
   - `API Key`: the `ofk_...` key from OneFile
   - `Object Prefix`: optional folder prefix such as `giopic`

The plugin also supports `Public Upload Link` mode. Paste either the public upload UUID or the full `/api/public-uploads/:uuid` URL.

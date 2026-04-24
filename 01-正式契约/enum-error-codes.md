# Enum And Error Codes

## Frontend request envelope error codes

| Code | Meaning inferred from frontend request wrapper | Evidence |
| --- | --- | --- |
| 1 | Success. `utils/request.js` resolves `res.data` only when `res.data.code == 1`. | utils/request.js:71 |
| 400 | Configuration update required; dispatches `config/getConfig` and rejects. | utils/request.js:75 |
| 401 | Unauthorized/login expired; dispatches user logout unless already on login page. | utils/request.js:83 |
| 710 | Wallet account not opened; prompts navigation to wallet page. | utils/request.js:91 |
| 702 | Real-name authentication missing; prompts navigation to certification page. | utils/request.js:105 |
| 4003 | Rejected without toast; frontend keeps backend payload. | utils/request.js:119 |
| 3003 | Rejected without toast; frontend keeps backend payload. | utils/request.js:120 |
| number | Other backend codes display `msg` or generic service busy message and reject. | utils/request.js:123 |

## Field enums

No backend enum source is available in the frontend project. Field-level enum candidates remain in `confidence.md` or `unresolved.md` unless a wrapper branch condition or stable consumer proves them.

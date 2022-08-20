# DynamoDB Schema

- There's three tables, each with pretty intuitive contents:
- Italic = _key_

### users

| _userID_ | _googleID_? | _githubID_? | _email_ | name   | g_payload?      | picture? | sessionIDs   |
| -------- | ----------- | ----------- | ------- | ------ | --------------- | -------- | ------------ |
| string   | string      | string      | string  | string | Map\<K: string> | string   | Set\<string> |

### restaurant

| _name_ | menu       | reviews | stars  |
| ------ | ---------- | ------- | ------ |
| string | MenuItem[] | number  | number |

### orders

| _userID_ | _restaurantName_ | _timestamp_ (sk) | items      | status |
| -------- | ---------------- | ---------------- | ---------- | ------ |
| string   | string           | number           | MenuItem[] | string |

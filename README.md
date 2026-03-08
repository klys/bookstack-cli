# bookstack-cli

CLI for interacting with the BookStack API from your terminal.

Install globally and use the `book-cli` command:

```bash
npm install -g bookstack-cli
```

## Requirements

- Node.js 18+
- A BookStack instance with API tokens

## Command

```bash
book-cli <command> [options]
```

View help:

```bash
book-cli --help
book-cli <command> --help
```

## Configuration

`book-cli` supports three credential sources, in this order (highest to lowest priority):

1. Command flags
2. `.bsrc` config file
3. Environment variables

### 1) Initialize `.bsrc` config

Save config in current directory:

```bash
book-cli init \
  --apihost https://docs.example.com \
  --apitoken YOUR_TOKEN_ID \
  --apisecret YOUR_TOKEN_SECRET
```

Save config globally to `~/.bsrc`:

```bash
book-cli init --global \
  --apihost https://docs.example.com \
  --apitoken YOUR_TOKEN_ID \
  --apisecret YOUR_TOKEN_SECRET
```

Example `.bsrc` file:

```json
{
  "apiHost": "https://docs.example.com",
  "apiKey": "YOUR_TOKEN_ID",
  "apiSecret": "YOUR_TOKEN_SECRET"
}
```

### 2) Environment variables

```bash
export BOOKSTACK_API_HOST=https://docs.example.com
export BOOKSTACK_API_KEY=YOUR_TOKEN_ID
export BOOKSTACK_API_SECRET=YOUR_TOKEN_SECRET
```

## Run API Methods

Syntax:

```bash
book-cli run <resource> <method> [args...] [--apihost ... --apitoken ... --apisecret ...]
```

Supported resources:

- `book` / `books`
- `page` / `pages`
- `chapter` / `chapters`
- `shelf` / `shelves`
- `user` / `users`

Common methods:

- `list(params?)`
- `create(data)`
- `read(id)`
- `update(id, data)`
- `delete(id)`

## Examples

List books:

```bash
book-cli run book list
```

List with query params:

```bash
book-cli run books list '{"count":5,"sort":"-id"}'
```

Read page by id:

```bash
book-cli run page read 15
```

Create chapter:

```bash
book-cli run chapter create '{"book_id":5,"name":"CLI Chapter"}'
```

Update shelf:

```bash
book-cli run shelf update 3 '{"name":"Updated Shelf"}'
```

Delete user:

```bash
book-cli run user delete 12
```

Use per-command credential overrides:

```bash
book-cli run book list \
  --apihost https://docs.example.com \
  --apitoken YOUR_TOKEN_ID \
  --apisecret YOUR_TOKEN_SECRET
```

## Argument Parsing Rules

`book-cli` automatically parses arguments as:

- Integer numbers (for example `15`)
- Booleans (`true` / `false`)
- JSON objects/arrays (`{"count":5}` or `[1,2,3]`)
- Plain strings (everything else)

## Output and Errors

- Successful responses are printed as formatted JSON.
- API or validation errors are printed to stderr and exit with code `1`.

## License

ISC

# Trellis

## Report Validation

Validate a report before building or reviewing it:

```sh
pnpm validate postgres-mvcc
```

The command prints hard validation errors first, warnings second, and exits non-zero only when errors are present.

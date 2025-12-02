# Troubleshooting Next.js HMR Errors

## Module Factory Not Available

**Error:**
```
Module [project]/node_modules/next/dist/lib/framework/boundary-components.js ... was instantiated because it was required from module ... but the module factory is not available. It might have been deleted in an HMR update.
```

**Cause:**
This error occurs when the Turbopack or Webpack cache in Next.js gets out of sync with the actual file system state during Hot Module Replacement (HMR). It is common when switching branches, making rapid changes, or after dependencies updates.

**Solution:**

1.  **Stop the Development Server:**
    Press `Ctrl+C` in the terminal running `npm run dev` for the web application.

2.  **Clear the Next.js Cache:**
    Delete the `.next` folder in the `apps/web` directory.

    **Windows (PowerShell):**
    ```powershell
    Remove-Item -Recurse -Force apps/web/.next
    ```

    **Mac/Linux:**
    ```bash
    rm -rf apps/web/.next
    ```

3.  **Restart the Server:**
    Run `npm run dev` again.

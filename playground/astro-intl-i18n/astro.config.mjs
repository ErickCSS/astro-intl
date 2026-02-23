// @ts-check
import { defineConfig } from 'astro/config';
import myIntegration from "astro-intl";

// https://astro.build/config
export default defineConfig({
    integrations: [myIntegration({ enabled: true })],

});

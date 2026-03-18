
import { colorSchemeDark, themeQuartz } from 'ag-grid-community';

export const theme = themeQuartz
    .withPart(colorSchemeDark)
    .withParams({
        backgroundColor: 'transparent',
    });
interface DeprecatedOptionPropertySegment {
    kind: 'property';
    name: string;
}
interface DeprecatedOptionDiscriminatorSegment {
    allowUndefined?: boolean;
    kind: 'discriminator';
    name: string;
    value: string;
}
type DeprecatedOptionMatchSegment = DeprecatedOptionDiscriminatorSegment | DeprecatedOptionPropertySegment;
interface DeprecatedOptionMetadata {
    docsPath: string;
    runtimePath: string;
    segments: Array<DeprecatedOptionMatchSegment>;
    text: string;
    version: string;
}
declare const deprecatedOptionsMetadata: Array<DeprecatedOptionMetadata>;
export type { DeprecatedOptionMatchSegment, DeprecatedOptionMetadata };
export { deprecatedOptionsMetadata };

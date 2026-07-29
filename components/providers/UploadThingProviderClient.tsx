"use client";

import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import type { EndpointMetadata } from "@uploadthing/shared";

export function UploadThingProviderClient({
  routerConfig,
}: {
  routerConfig: EndpointMetadata;
}) {
  return <NextSSRPlugin routerConfig={routerConfig} />;
}
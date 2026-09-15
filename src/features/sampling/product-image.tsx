import { Package } from "lucide-react";

export function SampleProductImage({ url, name }: { url: string | null; name: string }) {
  return url
    ? <div role="img" aria-label={name} className="aspect-[4/3] w-full bg-muted bg-cover bg-center" style={{ backgroundImage: `url(${JSON.stringify(url)})` }} />
    : <div className="flex aspect-[4/3] w-full items-center justify-center bg-muted text-muted-foreground"><Package aria-hidden="true" className="size-10" /></div>;
}

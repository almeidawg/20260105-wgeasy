import * as React from "react";
import { cn } from "@/lib/utils";

type ImageLoadingStatus = "idle" | "loading" | "loaded" | "error";

interface AvatarContextValue {
  imageLoadingStatus: ImageLoadingStatus;
  onImageLoadingStatusChange: (status: ImageLoadingStatus) => void;
}

const AvatarContext = React.createContext<AvatarContextValue | null>(null);

const useAvatarContext = () => {
  const context = React.useContext(AvatarContext);
  return context;
};

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, children, ...props }, ref) => {
    const [imageLoadingStatus, setImageLoadingStatus] =
      React.useState<ImageLoadingStatus>("idle");

    return (
      <AvatarContext.Provider
        value={{
          imageLoadingStatus,
          onImageLoadingStatusChange: setImageLoadingStatus,
        }}
      >
        <div
          ref={ref}
          className={cn(
            "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </AvatarContext.Provider>
    );
  }
);
Avatar.displayName = "Avatar";

interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, src, ...props }, ref) => {
    const context = useAvatarContext();
    const [status, setStatus] = React.useState<ImageLoadingStatus>(
      src ? "loading" : "error"
    );

    React.useEffect(() => {
      if (!src) {
        setStatus("error");
        context?.onImageLoadingStatusChange("error");
        return;
      }

      setStatus("loading");
      context?.onImageLoadingStatusChange("loading");

      const img = new Image();
      img.src = src;
      img.onload = () => {
        setStatus("loaded");
        context?.onImageLoadingStatusChange("loaded");
      };
      img.onerror = () => {
        setStatus("error");
        context?.onImageLoadingStatusChange("error");
      };
    }, [src, context]);

    if (status !== "loaded") return null;

    return (
      <img
        ref={ref}
        src={src}
        alt=""
        className={cn("aspect-square h-full w-full object-cover", className)}
        {...props}
      />
    );
  }
);
AvatarImage.displayName = "AvatarImage";

interface AvatarFallbackProps extends React.HTMLAttributes<HTMLSpanElement> {
  delayMs?: number;
}

const AvatarFallback = React.forwardRef<HTMLSpanElement, AvatarFallbackProps>(
  ({ className, delayMs = 0, ...props }, ref) => {
    const context = useAvatarContext();
    const [canRender, setCanRender] = React.useState(delayMs === 0);

    React.useEffect(() => {
      if (delayMs > 0) {
        const timer = setTimeout(() => setCanRender(true), delayMs);
        return () => clearTimeout(timer);
      }
    }, [delayMs]);

    // Hide fallback when image loaded successfully
    if (context?.imageLoadingStatus === "loaded") return null;
    if (!canRender) return null;

    return (
      <span
        ref={ref}
        className={cn(
          "flex h-full w-full items-center justify-center rounded-full bg-muted",
          className
        )}
        {...props}
      />
    );
  }
);
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };

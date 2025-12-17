import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { shimmer } from "@/lib/animations";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("relative overflow-hidden rounded-md bg-muted/50 dark:bg-muted/30", className)}
      {...props}
    >
      <motion.div
        className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-foreground/5 to-transparent"
        variants={shimmer}
        animate="animate"
      />
    </div>
  );
}

export { Skeleton };

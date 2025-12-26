'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { PanelLeft, PanelRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button, type ButtonProps } from '@/components/ui/button';

const sidebarVariants = cva('bg-card text-card-foreground transition-all', {
  variants: {
    side: {
      left: 'border-r',
      right: 'border-l',
    },
  },
  defaultVariants: {
    side: 'left',
  },
});

interface SidebarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sidebarVariants> {
        width?: string;
    }

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ side = 'left', className, width = '20rem', children, ...props }, ref) => {
    return (
      <aside
        ref={ref}
        className={cn(
          'w-[var(--sidebar-width)]',
          sidebarVariants({ side }),
          className
        )}
        style={{ '--sidebar-width': width } as React.CSSProperties}
        {...props}
      >
        {children}
      </aside>
    );
  }
);
Sidebar.displayName = 'Sidebar';


interface SidebarTriggerProps extends ButtonProps {
    side: 'left' | 'right';
}

const SidebarTrigger = React.forwardRef<HTMLButtonElement, SidebarTriggerProps>(
    ({ side, className, ...props }, ref) => {
        const Icon = side === 'left' ? PanelLeft : PanelRight;

        return (
            <Button
                ref={ref}
                variant="ghost"
                size="icon"
                className={cn('md:hidden', className)}
                {...props}
            >
                <Icon className="h-5 w-5" />
                <span className="sr-only">Toggle {side} sidebar</span>
            </Button>
        );
    }
);
SidebarTrigger.displayName = 'SidebarTrigger';

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('flex h-14 items-center border-b p-4', className)}
      {...props}
    />
  );
});
SidebarHeader.displayName = 'SidebarHeader';

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('flex-1 overflow-auto', className)}
      {...props}
    />
  );
});
SidebarContent.displayName = 'SidebarContent';

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('border-t p-4', className)}
      {...props}
    />
  );
});
SidebarFooter.displayName = 'SidebarFooter';

export {
  Sidebar,
  SidebarTrigger,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
};

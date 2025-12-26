'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { PanelLeft, PanelRight } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Button, type ButtonProps } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';

const SIDEBAR_WIDTH = '20rem';
const MOBILE_BREAKPOINT = 'md';

type SidebarContextValue = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isMobile: boolean;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}

const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useMediaQuery(`(max-width: 768px)`);
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen, isMobile }}>
      {children}
    </SidebarContext.Provider>
  );
};

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
    VariantProps<typeof sidebarVariants> {}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ side = 'left', className, children, ...props }, ref) => {
    const { isMobile, isOpen, setIsOpen } = useSidebar();
    
    // Logic specific to which sidebar this is
    const whichSidebar = `is${side.charAt(0).toUpperCase() + side.slice(1)}Open`;
    const openState = React.useState(false);
    const currentIsOpen = (useSidebar() as any)[whichSidebar];
    const setCurentIsOpen = (useSidebar() as any)[`set${side.charAt(0).toUpperCase() + side.slice(1)}Open`];

    if (isMobile) {
      return (
        <Sheet open={currentIsOpen} onOpenChange={setCurentIsOpen}>
          <SheetContent
            side={side}
            className={cn('w-[var(--sidebar-width)] p-0', className)}
            style={{ '--sidebar-width': SIDEBAR_WIDTH } as React.CSSProperties}
            {...props}
          >
            {children}
          </SheetContent>
        </Sheet>
      );
    }

    return (
      <aside
        ref={ref}
        className={cn(
          'w-[var(--sidebar-width)] hidden md:flex flex-col',
          sidebarVariants({ side }),
          className
        )}
        style={{ '--sidebar-width': SIDEBAR_WIDTH } as React.CSSProperties}
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
        const { isMobile, setIsOpen } = useSidebar();
        
        // This is a bit of a hack to get the correct context for each sidebar
        const setCurentIsOpen = (useSidebar() as any)[`set${side.charAt(0).toUpperCase() + side.slice(1)}Open`];

        if (!isMobile) return null;

        const Icon = side === 'left' ? PanelLeft : PanelRight;

        return (
            <Button
                ref={ref}
                variant="ghost"
                size="icon"
                className={cn('md:hidden', className)}
                onClick={() => setCurentIsOpen(true)}
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

// A new provider that manages state for both sidebars
const FullSidebarProvider = ({ children }: { children: React.ReactNode }) => {
    const isMobile = useMediaQuery(`(max-width: 768px)`);
    const [isLeftOpen, setLeftOpen] = React.useState(false);
    const [isRightOpen, setRightOpen] = React.useState(false);

    const value = {
        isMobile,
        isLeftOpen,
        setLeftOpen,
        isRightOpen,
        setRightOpen,
    }

    return (
        <SidebarContext.Provider value={value as any}>
            {children}
        </SidebarContext.Provider>
    )
}

export {
  FullSidebarProvider as SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  useSidebar,
};

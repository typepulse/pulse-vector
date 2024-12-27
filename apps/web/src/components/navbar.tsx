"use client";

import { Disclosure } from "@headlessui/react";
import { Link } from "./link";
import { Logo } from "./logo";
import { PlusGrid, PlusGridItem, PlusGridRow } from "./plus-grid";

export function Navbar({ banner }: { banner?: React.ReactNode }) {
  return (
    <Disclosure as="header" className="pt-12 sm:pt-16">
      <PlusGrid>
        <PlusGridRow className="relative flex justify-between">
          <div className="relative flex gap-6">
            <PlusGridItem className="py-3">
              <Link href="/" title="Home">
                <Logo className="h-9" />
              </Link>
            </PlusGridItem>
            {banner && (
              <div className="relative hidden items-center py-3 lg:flex">
                {banner}
              </div>
            )}
          </div>
        </PlusGridRow>
      </PlusGrid>
    </Disclosure>
  );
}

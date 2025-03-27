import { Badge } from "./ui/Badge";
import { Disclosure } from "@headlessui/react";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

interface FilterSidebarProps {
  allTags: string[];
  allMoods: string[];
  activeTag: string | null;
  activeMood: string | null;
  onTagFilter: (tag: string) => void;
  onMoodFilter: (mood: string) => void;
}

export function FilterSidebar({
  allTags,
  allMoods,
  activeTag,
  activeMood,
  onTagFilter,
  onMoodFilter,
}: FilterSidebarProps) {
  return (
    <div className="lg:sticky lg:top-8">
      <div className="lg:hidden">
        <Disclosure>
          {({ open }) => (
            <div>
              <Disclosure.Button className="flex w-full items-center justify-between rounded-lg bg-surface-light dark:bg-surface-dark px-4 py-2 text-left text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus-visible:ring focus-visible:ring-primary">
                <span>Filters</span>
                {open ? (
                  <ChevronUpIcon className="h-5 w-5" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5" />
                )}
              </Disclosure.Button>
              <Disclosure.Panel className="mt-2 space-y-4 px-4 pb-2">
                <FilterSection
                  title="Filter by tag"
                  items={allTags}
                  activeItem={activeTag}
                  onItemClick={onTagFilter}
                  prefix="#"
                />
                <FilterSection
                  title="Filter by mood"
                  items={allMoods}
                  activeItem={activeMood}
                  onItemClick={onMoodFilter}
                />
              </Disclosure.Panel>
            </div>
          )}
        </Disclosure>
      </div>

      <div className="hidden lg:block space-y-6">
        <FilterSection
          title="Filter by tag"
          items={allTags}
          activeItem={activeTag}
          onItemClick={onTagFilter}
          prefix="#"
        />
        <FilterSection
          title="Filter by mood"
          items={allMoods}
          activeItem={activeMood}
          onItemClick={onMoodFilter}
        />
      </div>
    </div>
  );
}

interface FilterSectionProps {
  title: string;
  items: string[];
  activeItem: string | null;
  onItemClick: (item: string) => void;
  prefix?: string;
}

function FilterSection({
  title,
  items,
  activeItem,
  onItemClick,
  prefix = "",
}: FilterSectionProps) {
  if (items.length === 0) return null;

  return (
    <div>
      <h2 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
        {title}
      </h2>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Badge
            key={item}
            variant={activeItem === item ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => onItemClick(item)}
          >
            {prefix}
            {item}
          </Badge>
        ))}
      </div>
    </div>
  );
}

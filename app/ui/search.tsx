'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

import { 
  // useSearchParams: It is a hook provided by Next.js that allows you to access and manipulate the query parameters in the URL. 
  // It returns an object that represents the current search parameters, which can be used to read or modify the query string.
  useSearchParams, 
  
  // usePathname: This hook is used to retrieve the current pathname of the URL. 
  // It returns a string representing the path portion of the URL, 
  // which can be useful for navigation or conditional rendering based on the current route.
  usePathname, 
  
  // useRouter: This hook is used to access the router instance, which provides methods for programmatic navigation, 
  // such as `replace` to update the URL without adding a new entry to the browser's history.
  useRouter } from 'next/navigation';

// Debouncing: Debouncing is a programming practice that limits the rate at which a function can fire. 
// In our case, you only want to query the database when the user has stopped typing.
import { useDebouncedCallback } from 'use-debounce';

export default function Search({ placeholder }: { placeholder: string }) {

  // Using the useSearchParams hook to get the current search parameters from the URL.
  const searchParams = useSearchParams();

  // Using the usePathname hook to get the current pathname of the URL.
  const pathname = usePathname();

  // Using the useRouter hook to get the router instance, which allows for programmatic navigation.
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term: string) => {

    console.log(`Searching... ${term}`);

    // Creating a new instance of URLSearchParams with the current search parameters.
    const params = new URLSearchParams(searchParams);

    params.set('page', '1');

    if (term) {

      // If a search term is provided, it sets the 'query' parameter in the URL.
      params.set('query', term);

    } else {

      // If the search term is empty, it removes the 'query' parameter from the URL.
      params.delete('query');
    }

    // Using the replace method from the router instance to update the URL with the new search parameters.
    // ${pathname} is the current path, in your case, "/dashboard/invoices".
    // 1. As the user types into the search bar, params.toString() translates this input into a URL-friendly format.
    // 2. replace(${pathname}?${params.toString()}) updates the URL with the user's search data. For example, /dashboard/invoices?query=lee if the user searches for "Lee".
    // 3. The URL is updated without reloading the page, ensuring a smooth user experience.
    replace(`${pathname}?${params.toString()}`);

  }, 300); // 300ms debounce delay

  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        onChange={(e) => { handleSearch(e.target.value); }}

        // To ensure the input field is in sync with the URL and will be populated when sharing, 
        // you can pass a defaultValue to input by reading from searchParams
        defaultValue={searchParams.get('query')?.toString()}
        
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}

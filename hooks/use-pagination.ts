interface UsePaginationProps {
  currentPage: number;
  totalPages: number;
  paginationItemsToDisplay?: number;
}

export function usePagination({
  currentPage,
  totalPages,
  paginationItemsToDisplay = 5,
}: UsePaginationProps) {
  const pages: number[] = [];
  const halfDisplay = Math.floor(paginationItemsToDisplay / 2);

  // Calculate the range of pages to display
  let startPage = Math.max(1, currentPage - halfDisplay);
  let endPage = Math.min(totalPages, startPage + paginationItemsToDisplay - 1);

  // Adjust start page if we're near the end
  if (endPage - startPage + 1 < paginationItemsToDisplay) {
    startPage = Math.max(1, endPage - paginationItemsToDisplay + 1);
  }

  // Generate the array of page numbers
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  // Determine if we need to show ellipsis
  const showLeftEllipsis = startPage > 1;
  const showRightEllipsis = endPage < totalPages;

  return {
    pages,
    showLeftEllipsis,
    showRightEllipsis,
  };
} 
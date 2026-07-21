interface UsePaginationProps {
  currentPage: number;
  totalPages: number;
  paginationItemsToDisplay: number;
}

export const usePagination = ({
  currentPage,
  totalPages,
  paginationItemsToDisplay,
}: UsePaginationProps) => {
  const getPageNumbers = () => {
    const pageNumbers: number[] = [];
    const halfDisplay = Math.floor(paginationItemsToDisplay / 2);

    let startPage = Math.max(1, currentPage - halfDisplay);
    let endPage = Math.min(totalPages, startPage + paginationItemsToDisplay - 1);

    if (endPage - startPage + 1 < paginationItemsToDisplay) {
      startPage = Math.max(1, endPage - paginationItemsToDisplay + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  const pages = getPageNumbers();
  const showLeftEllipsis = pages[0] > 1;
  const showRightEllipsis = pages[pages.length - 1] < totalPages;

  return {
    pages,
    showLeftEllipsis,
    showRightEllipsis,
  };
}; 
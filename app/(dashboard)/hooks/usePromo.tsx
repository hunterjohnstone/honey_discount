import { useState, useEffect } from 'react'
import { Promotion } from '../promotionForms/types';

//This has been updated so that it serves 
export function usePromotions(initialPage = 1, pageSize = 54) {
  const [paginatedData, setPaginatedData] = useState<Promotion[]>([]);
  const [allFilteredData, setAllFilteredData] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState({
    page: false,
    all: false,
    initial: true // Add initial loading state
  });
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: initialPage,
    totalPages: 1,
    totalItems: 0,
  });

  const fetchData = async (page = initialPage) => {
    setLoading(prev => ({...prev, page: true}));
    try {
      const response = await fetch(`/api/product/pagination?page=${page}&pageSize=${pageSize}`);
      if (!response.ok) throw new Error('Failed to fetch page');
      const result = await response.json();
      
      setPaginatedData(result.data);
      setPagination({
        currentPage: result.pagination.currentPage,
        totalPages: result.pagination.totalPages,
        totalItems: result.pagination.totalItems,
      });

      return result.data; // Return the fetched data

    } catch (err) {
      setError("Error getting page data");
      return []; // Return empty array on error
    } finally {
      setLoading(prev => ({...prev, page: false, initial: false}));
    }
  };

  const fetchAllData = async () => {
    if (allFilteredData.length > 0) return allFilteredData;
    
    setLoading(prev => ({...prev, all: true}));
    try {
      let allData: Promotion[] = [];
      let currentPage = 1;
      let totalPages = 1;

      // First fetch to get total pages
      const firstPage = await fetchData(1);
      allData = [...firstPage];
      totalPages = pagination.totalPages;

      // Fetch remaining pages
      while (currentPage < totalPages) {
        currentPage++;
        const nextPage = await fetchData(currentPage);
        allData = [...allData, ...nextPage];
      }

      setAllFilteredData(allData);
      return allData;
    } catch (err) {
      return [];
    } finally {
      fetchData(pagination.currentPage);
      setLoading(prev => ({...prev, all: false}));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data: paginatedData,
    allData: allFilteredData,
    loading,
    error,
    pagination,
    fetchData,
    fetchAllData,
  };
}
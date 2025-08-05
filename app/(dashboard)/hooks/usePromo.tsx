import { useState, useEffect } from 'react'
import { Promotion } from '../promotionForms/types';

export function usePromotions(initialPage = 1, pageSize = 10) {
  const [data, setData] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    currentPage: initialPage,
    totalPages: 1,
    totalItems: 0,
  });

  const fetchData = async (page = initialPage) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/product/pagination?page=${page}&pageSize=${pageSize}`)
      if (!response.ok) {
        throw new Error('Failed to fetch data')
      }
      const result = await response.json()
      setData(result.data)
      setPagination({
        currentPage: result.pagination.currentPage,
        totalPages: result.pagination.totalPages,
        totalItems: result.pagination.totalItems,
      })
    } catch (err) {
      setError("Error getting data")
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return {
    data,
    loading,
    error,
    pagination,
    fetchData,
  }
}
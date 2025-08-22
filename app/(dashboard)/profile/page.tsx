'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { MoreVertical, PencilIcon, TrashIcon } from 'lucide-react';
import useSWR from 'swr';
import { User } from '@/lib/db/schema';
import { useAtom } from 'jotai';
import { isAddingPromotionAtom, isEditingPromotionAtom } from './atom_state';
import EditPromotion from '../promotionForms/editPromotion';
import { Promotion } from '../promotionForms/types';
import AddPromoForm from '../promotionForms/addPromoForm';
import { toast } from 'react-toastify';
import UUIDImage from '@/components/UuidImage';

const fetcher = (url: string) => fetch(url).then((r) => r.json())


export default function ProfilePage() {
  const router = useRouter();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Promotion>>({});
  const [ promotionToEdit, setPromotionToEdit] = useState<Promotion>({
    id: '',
    title: '',
    description: '',
    price: "0.0",
    reported: [],
    imageUrl: '',
    category: 'food',
    mapLocation: [0,0],
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    location: 'granada',
    isActive: false,
    numReviews: 0,
    starAverage: 0,
    userId: 1,
    longDescription: "",
    imageLocation: undefined,
    discount: "0%",
    oldPrice: "0.0",
    website: "",
});
const {data: user } = useSWR<User>('/api/user', fetcher);


  const [isAddingPromotion, setIsAddingPromotionAtom] = useAtom(isAddingPromotionAtom);
  const [isEditingPromotion, setIsEditingPromotion ] = useAtom(isEditingPromotionAtom);

  useEffect(() => {
    //Fetch promotions straight away
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const response = await fetch('/api/product/get_data');
      if (!response.ok) throw new Error('Failed to fetch promotions');
      const data: Promotion[] = await response.json();
      setPromotions(data.filter((promotion) => promotion.userId === user?.id));
    } catch (error) {
      toast.error('Error loading your promotions');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  

  // Handle promotion deletion
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promotion?')) return;
    
    try {
      const response = await fetch(`/api/product/remove_product`, {
        method: 'DELETE',
        body: JSON.stringify({
          id
        })
      });

      if (response.ok) {
        setPromotions(promotions.filter(p => p.id !== id));
        toast.success('Promotion deleted successfully');
      } else {
        toast.info('failed to Delete promotion');
        throw new Error('Failed to delete promotion');
      }
    } catch (error) {
      toast.error('Error deleting promotion');
      console.error(error);
    }
  };

  // Handle edit submission
  const handleEditSubmit = async (id: string) => {
    try {
      const response = await fetch(`/api/promotions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        setPromotions(promotions.map(p => 
          p.id === id ? { ...p, ...editForm } : p
        ));
        setEditingId(null);
        toast.success('Promotion updated successfully');
      } else {
        throw new Error('Failed to update promotion');
      }
    } catch (error) {
      toast.error('Error updating promotion');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {promotions.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-600">You haven't created any promotions yet</h3>
          <Button className="mt-4 cursor-pointer" onClick={() => setIsAddingPromotionAtom(true)}>
            Create Your First Promotion
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Your promotions</h1>
            <Button className="cursor-pointer" onClick={() => setIsAddingPromotionAtom(true)}>
              Create New Promotion
            </Button>
        </div>
        <div 
        className='grid gap-6'
        style={{
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, clamp(250px, 30vw, 300px)), 1fr)'
        }}
        >
          {promotions.map((promotion) => (
            <Card key={promotion.id} className="hover:shadow-lg transition-shadow">
              {editingId === promotion.id ? (
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        value={editForm.title || promotion.title}
                        onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={editForm.description || promotion.description}
                        onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleEditSubmit(promotion.id)}
                        className="flex-1"
                      >
                        Save
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setEditingId(null)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              ) : (
                <>
                  <CardHeader className="relative">
                    <div className="absolute top-4 right-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button className="cursor-pointer" variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem className="cursor-pointer" onClick={() => {
                            setPromotionToEdit(promotion);
                            setIsEditingPromotion(true);
                          }}>
                            <PencilIcon className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(promotion.id)}
                            className="text-red-600 cursor-pointer"
                          >
                            <TrashIcon className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardTitle>{promotion.title}</CardTitle>
                    <CardDescription>{promotion.category}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48 overflow-hidden relative">
                        <UUIDImage
                          uuid={promotion.imageLocation!}
                          alt={promotion.title}
                          width={300} // Optimal size for your grid
                          height={200}
                          className="w-full h-full object-cover"
                          fallbackSrc="/default-product.jpg"
                        />
                      </div>
                    <p className="text-gray-700">{promotion.description}</p>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-lg font-bold">€{promotion.price}</span>
                      {promotion.endDate && 
                      <span className="text-sm text-gray-500">
                        Ends: {new Date(promotion.endDate).toLocaleDateString()}
                      </span>}
                    </div>
                  </CardContent>
                  {/* TODO:  Make sure this link works*/}
                  <CardFooter className="mt-auto py-4">
                    <div className="flex justify-between w-full">
                      <Button 
                        variant="outline" 
                        className="cursor-pointer"
                        onClick={() => router.push(`/${promotion.id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardFooter>
                </>
              )}
            </Card>
          ))}
          </div>
        </div>
      )}
      
        <div className="flex justify-between items-center mb-8 mt-8">
        <h1 className="text-3xl font-bold text-gray-800">Your favourite promotions</h1>
        </div>
        Coming soon...
        {/* Below is the adding promotion overlay */}
        <div>
          {user && isAddingPromotion && <AddPromoForm userId={user?.id} onSuccess={fetchPromotions}></AddPromoForm>} 
        </div>
        {/* Below is the editing promotion overlay */}
        <div>
          {user && isEditingPromotion && <EditPromotion promotionToEdit={promotionToEdit} onSuccess={fetchPromotions}></EditPromotion>}
        </div>

    </div>
  );
}
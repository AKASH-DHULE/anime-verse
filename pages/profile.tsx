import { useState, useRef, useEffect } from 'react';
import NextImage from 'next/image';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { auth, db } from '../lib/firebase';
import { updateProfile } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { User as UserIcon, Upload, ArrowLeft, Loader2, Sparkles, AlertCircle, Save } from 'lucide-react';
import Link from 'next/link';

export default function Profile() {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      setName(userProfile?.name || user.displayName || '');
      setPhotoUrl(userProfile?.photoURL || user.photoURL || '');
    }
  }, [user, userProfile, router]);

  // Handle image file selection, compress and convert to Base64
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setIsUploading(true);
    setError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      // Use window.Image to avoid conflict with NextImage
      const img = new window.Image();
      img.onload = () => {
        // Compress using Canvas
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 150;
        
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Export as compressed JPG
          const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
          setPhotoUrl(dataUrl);
        }
        setIsUploading(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !auth || !auth.currentUser || !db) return;

    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      // Update Firebase Auth Profile (only name, to avoid URL length limits on photoURL)
      await updateProfile(auth.currentUser, {
        displayName: name
      });

      // Update Firestore user document (safe to store base64 strings here)
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
         await updateDoc(userRef, {
           name: name,
           photoURL: photoUrl
         });
      }

      setSuccess('Profile updated successfully! ✧');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to update profile');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;

  return (
    <div className="min-h-[85vh] py-12 px-4 flex items-center justify-center relative">
      {/* Background Orbs */}
      <div className="absolute top-10 left-10 w-[300px] h-[300px] bg-accent/20 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-blue-600/20 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-lg relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        
        <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 shadow-2xl">
           <div className="text-center mb-8">
             <h1 className="text-3xl font-extrabold tracking-tight mb-2 flex items-center justify-center gap-2">
               YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-blue-500">PROFILE</span> <Sparkles className="w-6 h-6 text-accent" />
             </h1>
             <p className="text-gray-400 text-sm">Customize your AnimeVerse identity.</p>
           </div>

           {error && (
             <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 text-sm">
               <AlertCircle className="w-5 h-5 flex-shrink-0" />
               <p>{error}</p>
             </div>
           )}

           {success && (
             <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3 text-green-400 text-sm">
               <Sparkles className="w-5 h-5 flex-shrink-0" />
               <p>{success}</p>
             </div>
           )}

           <form onSubmit={handleSave} className="space-y-6">
             {/* Avatar Upload Section */}
             <div className="flex flex-col items-center justify-center">
               <div className="relative group cursor-pointer mb-2" onClick={() => fileInputRef.current?.click()}>
                 <div className="w-28 h-28 rounded-full border-2 border-gray-700 bg-gray-800 overflow-hidden flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:border-accent">
                   {isUploading ? (
                     <Loader2 className="w-8 h-8 text-accent animate-spin" />
                   ) : photoUrl ? (
                     <div className="relative w-full h-full">
                       <NextImage 
                         src={photoUrl} 
                         alt="Avatar" 
                         fill 
                         className="object-cover" 
                         unoptimized 
                       />
                     </div>
                   ) : (
                     <UserIcon className="w-12 h-12 text-gray-500 group-hover:text-accent transition-colors" />
                   )}
                 </div>
                 
                 <div className="absolute inset-0 rounded-full bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Upload className="w-6 h-6 text-white mb-1" />
                    <span className="text-[10px] font-bold text-white tracking-wider">CHANGE</span>
                 </div>
                 
                 <input 
                   type="file" 
                   ref={fileInputRef} 
                   onChange={handleImageChange}
                   accept="image/*"
                   className="hidden"
                 />
               </div>
               <p className="text-xs text-gray-500">Click to upload custom picture</p>
             </div>

             {/* Form Fields */}
             <div className="space-y-4 pt-4 border-t border-gray-800/50">
               <div className="space-y-2">
                 <label className="text-sm font-medium text-gray-400 ml-1">Nickname</label>
                 <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     <UserIcon className="w-5 h-5 text-gray-600" />
                   </div>
                   <input 
                     type="text" 
                     value={name}
                     onChange={(e) => setName(e.target.value)}
                     className="w-full bg-gray-950/50 border border-gray-800 focus:border-accent focus:ring-1 focus:ring-accent rounded-xl py-3 pl-11 pr-4 text-white transition-all outline-none"
                     placeholder="Your nickname"
                   />
                 </div>
               </div>

               <div className="space-y-2">
                 <label className="text-sm font-medium text-gray-400 ml-1">Email <span className="text-gray-600 text-xs ml-2">(Cannot be changed)</span></label>
                 <input 
                   type="text" 
                   value={user.email || ''}
                   disabled
                   className="w-full bg-gray-950 border border-gray-900 rounded-xl py-3 px-4 text-gray-500 cursor-not-allowed outline-none"
                 />
               </div>
             </div>

             <button 
               type="submit" 
               disabled={isSaving || isUploading}
               className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-white font-bold rounded-xl py-3.5 transition-all shadow-lg hover:shadow-accent/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-8"
             >
               {isSaving ? (
                 <Loader2 className="w-5 h-5 animate-spin" />
               ) : (
                 <>
                   <Save className="w-5 h-5" /> 
                   Save Changes
                 </>
               )}
             </button>
           </form>

        </div>
      </div>
    </div>
  );
}

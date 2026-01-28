import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserPreferences {
    age: number | null;
    showAdultContent: boolean;
    contentFilters:{
         violence:boolean;
         sexualContent:boolean
         provocativeThemes:boolean
    };
    setAge:(age:number) =>void
    setShowAdultContent: (show:boolean) => void
    updateContentFilter: (filter:keyof UserPreferences['contentFilters'],value: boolean) => void
    canViewAdultContent: () => boolean;
}

export const useUserPreferences = create<UserPreferences>()(
    persist(
        (set,get) => ({
            age: null,
            showAdultContent:false,
            contentFilters:{
                violence:false,
                sexualContent:false,
                provocativeThemes:false
            },
            setAge: (age: number) => set({age}),
            setShowAdultContent: (show: boolean) => set({ showAdultContent:show }),
            updateContentFilter: (filter, value) => 
                set(state => ({
                contentFilters: { ...state.contentFilters, [filter]: value }
                })),
                canViewAdultContent: () => {
        const { age, showAdultContent } = get();
        return showAdultContent && age !== null && age >= 18;
      }
        }),
        {
            name:'user-preferences-storage'
        }
    )
)
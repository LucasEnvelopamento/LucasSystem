import { useState, useEffect } from 'react';
import { supabase, hasRealConnection } from '../lib/supabase';

export const useProfiles = () => {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProfiles = async () => {
        if (hasRealConnection()) {
            const { data, error } = await supabase.from('profiles').select('id, nome, email, cargo, status, avatar_url, created_at').order('nome');
            if (!error && data) setProfiles(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchProfiles();
        if (hasRealConnection()) {
            const channel = supabase
                .channel('profiles-changes')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchProfiles)
                .subscribe();
            return () => supabase.removeChannel(channel);
        }
    }, []);

    const updateProfile = async (id, updates) => {
        if (hasRealConnection()) {
            const { error } = await supabase.from('profiles').update(updates).eq('id', id);
            return { success: !error, error };
        }
        return { success: true };
    };

    return { profiles, loading, updateProfile, fetchProfiles };
};

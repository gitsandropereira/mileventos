// Caminho: MIL_EVENTOS/components/Settings.tsx

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, ProfileInput, PixKeyTypeEnum } from '../src/schemas/profileSchema'; 
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Save, Loader2, AlertTriangle } from 'lucide-react'; // Lucide Icons

// 1. Funções de Dados (React Query)
const fetchProfile = async (): Promise<ProfileInput> => {
    // Implementação mock (troque pela chamada GET /api/settings/profile)
    const token = localStorage.getItem('authToken');
    const response = await axios.get('/api/settings/profile', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data; // Deve retornar um objeto ProfileInput
};

const updateProfile = async (data: ProfileInput) => {
    const token = localStorage.getItem('authToken');
    const response = await axios.put('/api/settings/profile', data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export default function Settings() {
  const queryClient = useQueryClient();

  // 2. Fetch de Dados Iniciais (GET)
  const { data: defaultValues, isLoading: isFetching, isError: fetchError } = useQuery({
    queryKey: ['userProfile'],
    queryFn: fetchProfile,
    staleTime: Infinity,
  });

  // 3. Configuração do React Hook Form + Zod
  const { register, handleSubmit, formState: { errors } } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: defaultValues, // Preenche o formulário com dados do servidor
    mode: 'onBlur',
  });

  // 4. Mutation (PUT)
  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      // Invalida o cache para forçar a atualização dos dados após sucesso
      queryClient.invalidateQueries({ queryKey: ['userProfile'] }); 
      alert('Perfil atualizado com sucesso!');
    },
    onError: (error) => {
      console.error(error);
      alert('Erro ao salvar o perfil.');
    },
  });

  const onSubmit = (data: ProfileInput) => {
    mutation.mutate(data);
  };

  if (isFetching) return <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600" /> Carregando perfil...</div>;
  if (fetchError) return <div className="p-8 text-center text-red-600"><AlertTriangle className="w-6 h-6 inline mr-2"/>Erro ao carregar dados.</div>;


  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-gray-900">Configurações de Perfil e Branding</h2>
      
      {/* 5. Formulário */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        
        {/* Campo Nome da Empresa */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label className="block">
            <span className="text-gray-700 font-medium">Nome da Empresa:</span>
            <input
              type="text"
              {...register('name')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </label>

          {/* Campo Categoria */}
          <label className="block">
            <span className="text-gray-700 font-medium">Categoria de Serviço:</span>
            <input
              type="text"
              {...register('category')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
          </label>
        </div>

        {/* PIX Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-200">
          <label className="block md:col-span-1">
            <span className="text-gray-700 font-medium">Tipo de Chave PIX:</span>
            <select
              {...register('pixKeyType')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {PixKeyTypeEnum.options.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.pixKeyType && <p className="mt-1 text-sm text-red-600">{errors.pixKeyType.message}</p>}
          </label>

          <label className="block md:col-span-2">
            <span className="text-gray-700 font-medium">Chave PIX:</span>
            <input
              type="text"
              {...register('pixKey')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.pixKey && <p className="mt-1 text-sm text-red-600">{errors.pixKey.message}</p>}
          </label>
        </div>

        {/* Bio */}
        <label className="block">
          <span className="text-gray-700 font-medium">Bio/Slogan (Opcional):</span>
          <textarea
            {...register('bio')}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.bio && <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>}
        </label>
        
        {/* Botão de Submissão */}
        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full inline-flex justify-center items-center py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out disabled:opacity-50"
        >
          {mutation.isPending ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Save className="mr-2 h-5 w-5" />
          )}
          {mutation.isPending ? 'Salvando...' : 'Salvar Configurações'}
        </button>

        {/* Mensagem de Erro/Sucesso Global (Opcional) */}
        {mutation.isError && <p className="text-sm text-red-600 text-center mt-3">Erro: Tente novamente mais tarde.</p>}
      </form>
    </div>
  );
}
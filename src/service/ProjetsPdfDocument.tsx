import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

interface Projet {
  id_projet: number;
  nom_projet: string;
  description: string;
  type: 'Route' | 'Batiment' | 'Pont';
  date_debut: string | null;
  date_fin_prevue: string | null;
  budget: number | null;
  is_deleted: boolean;
}

interface ProjetsPdfDocumentProps {
  projets: Projet[];
  titre?: string;
}

// Styles professionnels pour le PDF
const styles = StyleSheet.create({
  page: { padding: 30, backgroundColor: '#ffffff', fontFamily: 'Helvetica' },
  header: { borderBottomWidth: 2, borderBottomColor: '#2563eb', paddingBottom: 10, marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1e293b' },
  subtitle: { fontSize: 10, color: '#64748b', marginTop: 4 },
  table: { width: 'auto', borderStyle: 'solid', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 4, overflow: 'hidden' },
  tableRow: { flexDirection: 'row', backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', minHeight: 28, alignItems: 'center' },
  tableHeaderRow: { flexDirection: 'row', backgroundColor: '#2563eb', minHeight: 30, alignItems: 'center' },
  tableHeaderCell: { color: '#ffffff', fontSize: 10, fontWeight: 'bold', padding: 5 },
  tableCell: { fontSize: 9, color: '#334155', padding: 5 },
  colNom: { width: '35%' },
  colType: { width: '15%' },
  colDates: { width: '30%' },
  colBudget: { width: '20%', textAlign: 'right' },
  footer: { position: 'absolute', bottom: 20, left: 30, right: 30, textAlign: 'center', fontSize: 8, color: '#94a3b8', borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 5 }
});

export const ProjetsPdfDocument: React.FC<ProjetsPdfDocumentProps> = ({ projets, titre = "Rapport de Suivi des Chantiers" }) => {
  const formatBudget = (amount: number | null) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('fr-FR');
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête du document */}
        <View style={styles.header}>
          <Text style={styles.title}>{titre}</Text>
          <Text style={styles.subtitle}>Généré le {new Date().toLocaleDateString('fr-FR')} | COLASS Réseau Infrastructures</Text>
        </View>

        {/* Tableau des données */}
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableHeaderCell, styles.colNom]}>Nom du Projet</Text>
            <Text style={[styles.tableHeaderCell, styles.colType]}>Type</Text>
            <Text style={[styles.tableHeaderCell, styles.colDates]}>Période</Text>
            <Text style={[styles.tableHeaderCell, styles.colBudget]}>Budget</Text>
          </View>

          {projets.map((p) => (
            <View key={p.id_projet} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.colNom]}>{p.nom_projet}</Text>
              <Text style={[styles.tableCell, styles.colType]}>{p.type}</Text>
              <Text style={[styles.tableCell, styles.colDates]}>{formatDate(p.date_debut)} au {formatDate(p.date_fin_prevue)}</Text>
              <Text style={[styles.tableCell, styles.colBudget, { fontWeight: 'bold' }]}>{formatBudget(p.budget)}</Text>
            </View>
          ))}
        </View>

        {/* Pied de page */}
        <Text style={styles.footer} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
      </Page>
    </Document>
  );
};
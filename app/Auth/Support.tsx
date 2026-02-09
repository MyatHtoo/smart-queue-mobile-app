import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, IconButton, List, Chip } from 'react-native-paper';

type Props = {
  navigation: any;
};

const SupportScreen = ({ navigation }: Props) => {
  const [activeTab, setActiveTab] = useState('FAQ');
  
  const [activeCategory, setActiveCategory] = useState('General');
  
  const [expandedId, setExpandedId] = useState<string | null>('1');

  const handlePress = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const faqData = [
    {
      id: '1',
      question: 'How do I manage my notifications?',
      answer: 'You can manage your notifications by going to Settings > Notifications. From there, you can customize which alerts you want to receive and how you want to be notified.',
    },
    {
      id: '2',
      question: 'Is my data safe and private?',
      answer: 'Yes, we take data security very seriously. All your personal information is encrypted and stored securely. We never share your data with third parties without your consent.',
    },
    {
      id: '3',
      question: 'How do I change my language?',
      answer: 'To change your language preference, go to Settings > Language & Region. Select your preferred language from the list of available options.',
    },
    {
      id: '4',
      question: 'Can I cancel my queue in last minute?',
      answer: 'Yes, you can cancel your queue booking up until your scheduled time. However, please note that last-minute cancellations may be subject to our cancellation policy.',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          iconColor="#000"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />
        <Text style={styles.headerTitle}>Support</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'FAQ' && styles.activeTab]}
          onPress={() => setActiveTab('FAQ')}
        >
          <Text style={[styles.tabText, activeTab === 'FAQ' && styles.activeTabText]}>
            FAQ
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Contact Us' && styles.activeTab]}
          onPress={() => setActiveTab('Contact Us')}
        >
          <Text style={[styles.tabText, activeTab === 'Contact Us' && styles.activeTabText]}>
            Contact Us
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'FAQ' ? (
        <>
          <View style={styles.chipsContainer}>
            <Chip
              selected={activeCategory === 'General'}
              onPress={() => setActiveCategory('General')}
              style={[
                styles.chip,
                activeCategory === 'General' && styles.activeChip,
              ]}
              textStyle={[
                styles.chipText,
                activeCategory === 'General' && styles.activeChipText,
              ]}
              mode={activeCategory === 'General' ? 'flat' : 'outlined'}
            >
              General
            </Chip>
            <Chip
              selected={activeCategory === 'Account'}
              onPress={() => setActiveCategory('Account')}
              style={[
                styles.chip,
                activeCategory === 'Account' && styles.activeChip,
              ]}
              textStyle={[
                styles.chipText,
                activeCategory === 'Account' && styles.activeChipText,
              ]}
              mode={activeCategory === 'Account' ? 'flat' : 'outlined'}
            >
              Account
            </Chip>
            <Chip
              selected={activeCategory === 'Services'}
              onPress={() => setActiveCategory('Services')}
              style={[
                styles.chip,
                activeCategory === 'Services' && styles.activeChip,
              ]}
              textStyle={[
                styles.chipText,
                activeCategory === 'Services' && styles.activeChipText,
              ]}
              mode={activeCategory === 'Services' ? 'flat' : 'outlined'}
            >
              Services
            </Chip>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <List.Section style={styles.accordionSection}>
              {faqData.map((faq) => (
                <List.Accordion
                  key={faq.id}
                  title={faq.question}
                  expanded={expandedId === faq.id}
                  onPress={() => handlePress(faq.id)}
                  style={styles.accordion}
                  titleStyle={styles.accordionTitle}
                  titleNumberOfLines={2}
                  right={(props) => (
                    <List.Icon
                      {...props}
                      icon={expandedId === faq.id ? 'chevron-up' : 'chevron-down'}
                      color="#666"
                    />
                  )}
                >
                  <View style={styles.answerContainer}>
                    <Text style={styles.answerText}>{faq.answer}</Text>
                  </View>
                </List.Accordion>
              ))}
            </List.Section>
          </ScrollView>
        </>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.contactList}>
            <TouchableOpacity style={styles.contactItem}>
              <IconButton
                icon="headset"
                size={28}
                iconColor="#000"
                style={styles.contactItemIcon}
              />
              <Text style={styles.contactItemText}>Customer Services</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactItem}>
              <IconButton
                icon="whatsapp"
                size={28}
                iconColor="#000"
                style={styles.contactItemIcon}
              />
              <Text style={styles.contactItemText}>WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactItem}>
              <IconButton
                icon="web"
                size={28}
                iconColor="#000"
                style={styles.contactItemIcon}
              />
              <Text style={styles.contactItemText}>Website</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactItem}>
              <IconButton
                icon="facebook"
                size={28}
                iconColor="#000"
                style={styles.contactItemIcon}
              />
              <Text style={styles.contactItemText}>Facebook</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactItem}>
              <IconButton
                icon="twitter"
                size={28}
                iconColor="#000"
                style={styles.contactItemIcon}
              />
              <Text style={styles.contactItemText}>Twitter</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactItem}>
              <IconButton
                icon="instagram"
                size={28}
                iconColor="#000"
                style={styles.contactItemIcon}
              />
              <Text style={styles.contactItemText}>Instagram</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    margin: 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 48,
  },

  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#000',
  },
  tabText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#000',
    fontWeight: 'bold',
  },

  chipsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 10,
    backgroundColor: '#fff',
  },
  chip: {
    backgroundColor: '#fff',
    borderColor: '#E0E0E0',
    borderRadius: 20,
  },
  activeChip: {
    backgroundColor: '#1A80A4',
    borderRadius: 20,
  },
  chipText: {
    color: '#666',
    fontSize: 14,
  },
  activeChipText: {
    color: '#fff',
    fontWeight: '600',
  },

  content: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },

  accordionSection: {
    marginTop: 0,
  },
  accordion: {
    backgroundColor: '#F0F0F0',
    marginBottom: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  accordionTitle: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  answerContainer: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 15,
  },
  answerText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },

  contactList: {
    padding: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  contactItemIcon: {
    margin: 0,
    marginRight: 10,
  },
  contactItemText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
});

export default SupportScreen;

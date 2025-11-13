import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  SafeAreaView,
  Linking,
} from 'react-native';

type CourseType = 'starter' | 'main meal' | 'dessert';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  course: CourseType;
  price: string;
}

const ChefApp: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedMenuItems, setSelectedMenuItems] = useState<MenuItem[]>([]);
  const [dishName, setDishName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<CourseType>('starter');
  const [price, setPrice] = useState('');
  const [activeTab, setActiveTab] = useState<'home' | 'form' | 'menu' | 'planner' | 'guest' | 'contact'>('home');
  const [menuName, setMenuName] = useState('');
  const [menuDescription, setMenuDescription] = useState('');
  const [guestFilter, setGuestFilter] = useState<CourseType | 'all'>('all');

  const courses: CourseType[] = ['starter', 'main meal', 'dessert'];

  //*Restaurant information*//
  const restaurantInfo = {
    name: "Christoffel's Heavenly Cuisine",
    phone: '+27 123 456 7890',
    email: 'info@christoffelscuisine.com',
    address: '123 Gourmet Avenue\nCulinary District, CD 10001',
    hours: {
      monday: '11:00 AM - 10:00 PM',
      tuesday: '11:00 AM - 10:00 PM',
      wednesday: '11:00 AM - 10:00 PM',
      thursday: '11:00 AM - 11:00 PM',
      friday: '11:00 AM - 12:00 AM',
      saturday: '10:00 AM - 12:00 AM',
      sunday: '10:00 AM - 9:00 PM'
    },
    socialMedia: {
      instagram: 'christoffels_cuisine',
      facebook: 'ChristoffelsHeavenlyCuisine',
      twitter: 'ChristoffelsFood'
    }
  };

  //*Calculate average prices by course*//
  const calculateAveragePrices = () => {
    const courseStats = courses.map(course => {
      const courseItems = menuItems.filter(item => item.course === course);
      const total = courseItems.reduce((sum, item) => sum + parseFloat(item.price), 0);
      const average = courseItems.length > 0 ? total / courseItems.length : 0;
      
      return {
        course,
        count: courseItems.length,
        average: average.toFixed(2),
        total: total.toFixed(2)
      };
    });

    //*Overall statistics*//
    const totalItems = menuItems.length;
    const overallAverage = totalItems > 0 
      ? (menuItems.reduce((sum, item) => sum + parseFloat(item.price), 0) / totalItems).toFixed(2)
      : '0.00';

    return { courseStats, overallAverage, totalItems };
  };

  //*Add menu item to the array*//
  const addMenuItem = () => {
    //*Validation*//
    if (!dishName.trim() || !description.trim() || !price.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      Alert.alert('Error', 'Please enter a valid price greater than 0');
      return;
    }

    if (priceValue >= 100) {
      Alert.alert('Error', 'Price must be less than $100');
      return;
    }

    const newItem: MenuItem = {
      id: Date.now().toString(),
      name: dishName.trim(),
      description: description.trim(),
      course: selectedCourse,
      price: priceValue.toFixed(2),
    };

    //*Save to menu items array*//
    setMenuItems(prevItems => [...prevItems, newItem]);
    setDishName('');
    setDescription('');
    setSelectedCourse('starter');
    setPrice('');
    Alert.alert('Success', 'Menu item added successfully!');
  };

  //*Remove menu item from the array*//
  const removeMenuItem = (itemId: string) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from the menu?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setMenuItems(prevItems => prevItems.filter(item => item.id !== itemId));
            //*Also remove from selected menu items if it's there*//
            setSelectedMenuItems(prev => prev.filter(item => item.id !== itemId));
            Alert.alert('Success', 'Menu item removed successfully!');
          },
        },
      ]
    );
  };

  //*Remove all menu items*//
  const removeAllMenuItems = () => {
    if (menuItems.length === 0) {
      Alert.alert('No Items', 'There are no menu items to remove.');
      return;
    }

    Alert.alert(
      'Remove All Items',
      'Are you sure you want to remove ALL menu items? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove All',
          style: 'destructive',
          onPress: () => {
            setMenuItems([]);
            setSelectedMenuItems([]);
            Alert.alert('Success', 'All menu items have been removed!');
          },
        },
      ]
    );
  };

  const toggleMenuItemSelection = (item: MenuItem) => {
    setSelectedMenuItems(prev => {
      const isSelected = prev.some(selectedItem => selectedItem.id === item.id);
      if (isSelected) {
        return prev.filter(selectedItem => selectedItem.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  };

  const addAllToMenuPlanner = () => {
    if (menuItems.length === 0) {
      Alert.alert('No Items', 'There are no menu items to add to the planner.');
      return;
    }
    setSelectedMenuItems([...menuItems]);
    Alert.alert('Success', 'All menu items have been added to the menu planner!');
  };

  const clearMenuPlanner = () => {
    setSelectedMenuItems([]);
    setMenuName('');
    setMenuDescription('');
  };

  const calculateMenuTotal = () => {
    return selectedMenuItems.reduce((total, item) => total + parseFloat(item.price), 0).toFixed(2);
  };

  const getCourseColor = (course: CourseType) => {
    switch (course) {
      case 'starter':
        return '#6907bfff';
      case 'main meal':
        return '#620bcdff';
      case 'dessert':
        return '#6504abff';
      default:
        return '#FF6B6B';
    }
  };

  //*Filter menu items for guest view*//
  const getFilteredMenuItems = () => {
    if (guestFilter === 'all') {
      return menuItems;
    }
    return menuItems.filter(item => item.course === guestFilter);
  };

  //*Contact actions*//
  const makePhoneCall = () => {
    Linking.openURL(`tel:${restaurantInfo.phone}`);
  };

  const sendEmail = () => {
    Linking.openURL(`mailto:${restaurantInfo.email}`);
  };

  const openMaps = () => {
    const address = encodeURIComponent(restaurantInfo.address.replace('\n', ', '));
    Linking.openURL(`https://maps.google.com/?q=${address}`);
  };

  //*Render Home Screen with Average Prices*//
  const renderHome = () => {
    const { courseStats, overallAverage, totalItems } = calculateAveragePrices();

    return (
      <ScrollView 
        style={styles.homeScrollContainer}
        contentContainerStyle={styles.homeScrollContent}
        showsVerticalScrollIndicator={true}
        scrollEventThrottle={16}
      >
        <View style={styles.homeContainer}>
          <Text style={styles.sectionTitle}>Menu Overview</Text>
          
          {/* Overall Statistics */}
          <View style={styles.overallStats}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{totalItems}</Text>
              <Text style={styles.statLabel}>Total Items</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>${overallAverage}</Text>
              <Text style={styles.statLabel}>Avg Price</Text>
            </View>
          </View>

          {/* Course Breakdown */}
          <Text style={styles.subTitle}>Average Prices by Course</Text>
          <View style={styles.courseStatsContainer}>
            {courseStats.map((stat) => (
              <View 
                key={stat.course} 
                style={[
                  styles.courseStatCard,
                  { borderLeftColor: getCourseColor(stat.course as CourseType) }
                ]}
              >
                <View style={styles.courseStatHeader}>
                  <Text style={styles.courseName}>
                    {stat.course.charAt(0).toUpperCase() + stat.course.slice(1)}
                  </Text>
                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>{stat.count}</Text>
                  </View>
                </View>
                
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Average Price:</Text>
                  <Text style={styles.statValue}>${stat.average}</Text>
                </View>
                
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Total Value:</Text>
                  <Text style={styles.statValue}>${stat.total}</Text>
                </View>
                
                {stat.count === 0 && (
                  <Text style={styles.noItemsText}>No items yet</Text>
                )}
              </View>
            ))}
          </View>

          {/* Recent Activity Section */}
          <View style={styles.recentActivity}>
            <Text style={styles.subTitle}>Recent Activity</Text>
            <View style={styles.activityCard}>
              {menuItems.length === 0 ? (
                <Text style={styles.noActivityText}>
                  No recent activity. Start by adding menu items!
                </Text>
              ) : (
                <>
                  <Text style={styles.activityText}>
                    Last added: <Text style={styles.highlightText}>{menuItems[menuItems.length - 1]?.name}</Text>
                  </Text>
                  <Text style={styles.activityText}>
                    Menu created: <Text style={styles.highlightText}>{new Date().toLocaleDateString()}</Text>
                  </Text>
                  <Text style={styles.activityText}>
                    Most expensive: <Text style={styles.highlightText}>
                      ${Math.max(...menuItems.map(item => parseFloat(item.price))).toFixed(2)}
                    </Text>
                  </Text>
                  <Text style={styles.activityText}>
                    Total menu value: <Text style={styles.highlightText}>
                      ${menuItems.reduce((sum, item) => sum + parseFloat(item.price), 0).toFixed(2)}
                    </Text>
                  </Text>
                </>
              )}
            </View>
          </View>

          {/* Quick Tips Section */}
          <View style={styles.tipsSection}>
            <Text style={styles.subTitle}>Quick Tips</Text>
            <View style={styles.tipCard}>
              <Text style={styles.tipText}> Balance your menu with items from all courses</Text>
              <Text style={styles.tipText}> Consider seasonal ingredients for specials</Text>
              <Text style={styles.tipText}> Use the Menu Planner to create custom menus</Text>
              <Text style={styles.tipText}> Regularly update prices based on ingredient costs</Text>
              <Text style={styles.tipText}> Long press any menu item to remove it</Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <Text style={styles.subTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity 
                style={styles.quickActionButton}
                onPress={() => setActiveTab('form')}
              >
                <Text style={styles.quickActionIcon}></Text>
                <Text style={styles.quickActionText}>Add New Item</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickActionButton}
                onPress={() => setActiveTab('menu')}
              >
                <Text style={styles.quickActionIcon}></Text>
                <Text style={styles.quickActionText}>View Full Menu</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.quickActionButton, styles.plannerButton]}
                onPress={() => setActiveTab('planner')}
              >
                <Text style={styles.quickActionIcon}></Text>
                <Text style={styles.quickActionText}>Menu Planner</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.quickActionButton, styles.guestButton]}
                onPress={() => setActiveTab('guest')}
              >
                <Text style={styles.quickActionIcon}></Text>
                <Text style={styles.quickActionText}>Guest View</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.quickActionButton, styles.contactButton]}
                onPress={() => setActiveTab('contact')}
              >
                <Text style={styles.quickActionIcon}></Text>
                <Text style={styles.quickActionText}>Contact Info</Text>
              </TouchableOpacity>
              {menuItems.length > 0 && (
                <TouchableOpacity 
                  style={[styles.quickActionButton, styles.removeAllButton]}
                  onPress={removeAllMenuItems}
                >
                  <Text style={styles.quickActionIcon}></Text>
                  <Text style={styles.quickActionText}>Remove All</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Footer Spacer */}
          <View style={styles.footerSpacer} />
        </View>
      </ScrollView>
    );
  };

  const renderForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.sectionTitle}>Add New Menu Item</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Dish Name"
        placeholderTextColor="#000000ff"
        value={dishName}
        onChangeText={setDishName}
        maxLength={50}
      />
      
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Description"
        placeholderTextColor="#060607ff"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
        maxLength={200}
      />
      
      <Text style={styles.label}>Select Course:</Text>
      <View style={styles.courseContainer}>
        {courses.map((course) => (
          <TouchableOpacity
            key={course}
            style={[
              styles.courseButton,
              selectedCourse === course && {
                backgroundColor: getCourseColor(course),
                borderColor: getCourseColor(course),
              },
            ]}
            onPress={() => setSelectedCourse(course)}
          >
            <Text
              style={[
                styles.courseButtonText,
                selectedCourse === course && styles.courseButtonTextSelected,
              ]}
            >
              {course.charAt(0).toUpperCase() + course.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <TextInput
        style={styles.input}
        placeholder="Price"
        placeholderTextColor="#000000ff"
        value={price}
        onChangeText={setPrice}
        keyboardType="decimal-pad"
      />
      
      <TouchableOpacity style={styles.addButton} onPress={addMenuItem}>
        <Text style={styles.addButtonText}>Add to Menu</Text>
      </TouchableOpacity>

      {menuItems.length > 0 && (
        <TouchableOpacity 
          style={[styles.addButton, styles.removeAllButtonForm]}
          onPress={removeAllMenuItems}
        >
          <Text style={styles.addButtonText}>Remove All Items</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderMenu = () => (
    <View style={styles.menuContainer}>
      <View style={styles.menuHeader}>
        <Text style={styles.sectionTitle}>Chef's Menu</Text>
        <View style={styles.headerActions}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>
              Total Items: <Text style={styles.totalCount}>{menuItems.length}</Text>
            </Text>
          </View>
          {menuItems.length > 0 && (
            <TouchableOpacity 
              style={styles.removeAllHeaderButton}
              onPress={removeAllMenuItems}
            >
              <Text style={styles.removeAllHeaderText}>Remove All</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {menuItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No menu items yet.</Text>
          <Text style={styles.emptyStateSubText}>
            Start by adding some delicious dishes!
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.menuList}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                { borderLeftColor: getCourseColor(item.course) },
              ]}
              onLongPress={() => removeMenuItem(item.id)}
              delayLongPress={500}
            >
              <View style={styles.menuItemHeader}>
                <Text style={styles.menuItemName}>{item.name}</Text>
                <Text style={styles.menuItemPrice}>${item.price}</Text>
              </View>
              <Text style={styles.menuItemDescription}>{item.description}</Text>
              <View style={styles.menuItemFooter}>
                <View style={styles.courseBadge}>
                  <Text
                    style={[
                      styles.courseBadgeText,
                      { color: getCourseColor(item.course) },
                    ]}
                  >
                    {item.course.charAt(0).toUpperCase() + item.course.slice(1)}
                  </Text>
                </View>
                <Text style={styles.removeHintText}>Long press to remove</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );

  const renderMenuPlanner = () => (
    <View style={styles.plannerContainer}>
      <Text style={styles.sectionTitle}>Menu Planner</Text>
      
      {/* Menu Details */}
      <View style={styles.plannerHeader}>
        <TextInput
          style={styles.input}
          placeholder="Menu Name (e.g., Summer Special, Wedding Menu)"
          placeholderTextColor="#000000ff"
          value={menuName}
          onChangeText={setMenuName}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Menu Description"
          placeholderTextColor="#060607ff"
          value={menuDescription}
          onChangeText={setMenuDescription}
          multiline
          numberOfLines={2}
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.plannerActions}>
        <TouchableOpacity 
          style={[styles.plannerActionButton, styles.addAllButton]}
          onPress={addAllToMenuPlanner}
        >
          <Text style={styles.plannerActionText}>Add All Items</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.plannerActionButton, styles.clearButton]}
          onPress={clearMenuPlanner}
        >
          <Text style={styles.plannerActionText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      {/* Selected Items Summary */}
      <View style={styles.plannerSummary}>
        <Text style={styles.summaryText}>
          Selected Items: <Text style={styles.summaryCount}>{selectedMenuItems.length}</Text>
        </Text>
        <Text style={styles.summaryText}>
          Total Price: <Text style={styles.summaryTotal}>${calculateMenuTotal()}</Text>
        </Text>
      </View>

      {/* Available Items */}
      <Text style={styles.subTitle}>Available Menu Items</Text>
      <ScrollView style={styles.plannerList}>
        {menuItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No menu items available.</Text>
            <Text style={styles.emptyStateSubText}>
              Add some items first to build your menu!
            </Text>
          </View>
        ) : (
          menuItems.map((item) => {
            const isSelected = selectedMenuItems.some(selectedItem => selectedItem.id === item.id);
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.plannerItem,
                  { borderLeftColor: getCourseColor(item.course) },
                  isSelected && styles.selectedPlannerItem
                ]}
                onPress={() => toggleMenuItemSelection(item)}
                onLongPress={() => removeMenuItem(item.id)}
                delayLongPress={500}
              >
                <View style={styles.plannerItemHeader}>
                  <Text style={styles.plannerItemName}>{item.name}</Text>
                  <Text style={styles.plannerItemPrice}>${item.price}</Text>
                </View>
                <Text style={styles.plannerItemDescription}>{item.description}</Text>
                <View style={styles.plannerItemFooter}>
                  <View style={styles.courseBadge}>
                    <Text
                      style={[
                        styles.courseBadgeText,
                        { color: getCourseColor(item.course) },
                      ]}
                    >
                      {item.course.charAt(0).toUpperCase() + item.course.slice(1)}
                    </Text>
                  </View>
                  <View style={styles.plannerItemActions}>
                    {isSelected && (
                      <View style={styles.selectedBadge}>
                        <Text style={styles.selectedBadgeText}>✓ Selected</Text>
                      </View>
                    )}
                    <Text style={styles.removeHintTextSmall}>Long press to remove</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Selected Items Preview */}
      {selectedMenuItems.length > 0 && (
        <View style={styles.selectedPreview}>
          <Text style={styles.subTitle}>Your Selected Menu</Text>
          <ScrollView horizontal style={styles.previewScroll}>
            {selectedMenuItems.map((item) => (
              <View key={item.id} style={styles.previewItem}>
                <Text style={styles.previewItemName}>{item.name}</Text>
                <Text style={styles.previewItemPrice}>${item.price}</Text>
                <Text style={styles.previewItemCourse}>{item.course}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );

  const renderGuestView = () => {
    const filteredItems = getFilteredMenuItems();
    
    return (
      <View style={styles.guestContainer}>
        <View style={styles.guestHeader}>
          <Text style={styles.sectionTitle}>Guest Menu View</Text>
          <Text style={styles.guestSubtitle}>
            Browse our delicious offerings by course
          </Text>
        </View>

        {/* Course Filter Buttons */}
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Filter by Course:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <View style={styles.filterButtons}>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  guestFilter === 'all' && styles.filterButtonActive,
                ]}
                onPress={() => setGuestFilter('all')}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    guestFilter === 'all' && styles.filterButtonTextActive,
                  ]}
                >
                  All Courses
                </Text>
              </TouchableOpacity>
              {courses.map((course) => (
                <TouchableOpacity
                  key={course}
                  style={[
                    styles.filterButton,
                    guestFilter === course && styles.filterButtonActive,
                    guestFilter === course && { backgroundColor: getCourseColor(course) },
                  ]}
                  onPress={() => setGuestFilter(course)}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      guestFilter === course && styles.filterButtonTextActive,
                    ]}
                  >
                    {course.charAt(0).toUpperCase() + course.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Results Summary */}
        <View style={styles.guestSummary}>
          <Text style={styles.guestSummaryText}>
            Showing {filteredItems.length} {guestFilter === 'all' ? 'total' : guestFilter} items
          </Text>
        </View>

        {/* Menu Items */}
        {menuItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No menu items available yet.</Text>
            <Text style={styles.emptyStateSubText}>
              Please check back later for our delicious offerings!
            </Text>
          </View>
        ) : filteredItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No {guestFilter} items available.</Text>
            <Text style={styles.emptyStateSubText}>
              Try selecting a different course filter.
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.guestList}>
            {filteredItems.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.guestMenuItem,
                  { borderLeftColor: getCourseColor(item.course) },
                ]}
              >
                <View style={styles.guestItemHeader}>
                  <View style={styles.guestItemTitle}>
                    <Text style={styles.guestItemName}>{item.name}</Text>
                    <View style={[
                      styles.guestCourseBadge,
                      { backgroundColor: getCourseColor(item.course) }
                    ]}>
                      <Text style={styles.guestCourseBadgeText}>
                        {item.course.charAt(0).toUpperCase() + item.course.slice(1)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.guestItemPrice}>${item.price}</Text>
                </View>
                <Text style={styles.guestItemDescription}>{item.description}</Text>
                
                {/* Course-specific emoji */}
                <View style={styles.guestItemFooter}>
                  <Text style={styles.guestItemEmoji}>
                    {item.course === 'starter' ? '' : 
                     item.course === 'main meal' ? '' : ''}
                  </Text>
                  <Text style={styles.guestItemCourseHint}>
                    Perfect for {item.course === 'starter' ? 'starting' : 
                               item.course === 'main meal' ? 'your main' : 'ending'} your meal
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Course Statistics */}
        {guestFilter === 'all' && menuItems.length > 0 && (
          <View style={styles.guestStats}>
            <Text style={styles.subTitle}>Menu Overview</Text>
            <View style={styles.guestStatsGrid}>
              {courses.map((course) => {
                const courseItems = menuItems.filter(item => item.course === course);
                return (
                  <View key={course} style={styles.guestStatCard}>
                    <Text style={styles.guestStatNumber}>{courseItems.length}</Text>
                    <Text style={styles.guestStatLabel}>
                      {course.charAt(0).toUpperCase() + course.slice(1)}s
                    </Text>
                    <View style={[
                      styles.guestStatIndicator,
                      { backgroundColor: getCourseColor(course) }
                    ]} />
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderContactInfo = () => (
    <ScrollView 
      style={styles.contactContainer}
      contentContainerStyle={styles.contactContent}
      showsVerticalScrollIndicator={true}
    >
      <View style={styles.contactHeader}>
        <Text style={styles.contactTitle}>Contact & Information</Text>
        <Text style={styles.contactSubtitle}>
          We'd love to hear from you!
        </Text>
      </View>

      {/* Restaurant Overview */}
      <View style={styles.infoCard}>
        <Text style={styles.infoCardTitle}>About Our Restaurant</Text>
        <Text style={styles.infoCardText}>
          At Christoffel's Heavenly Cuisine, we craft exceptional dining experiences 
          using the finest ingredients and traditional cooking techniques. Our passion 
          for culinary excellence is reflected in every dish we serve.
        </Text>
      </View>

      {/* Contact Details */}
      <View style={styles.infoCard}>
        <Text style={styles.infoCardTitle}>Contact Details</Text>
        
        <TouchableOpacity style={styles.contactItem} onPress={makePhoneCall}>
          <Text style={styles.contactIcon}></Text>
          <View style={styles.contactTextContainer}>
            <Text style={styles.contactLabel}>Phone Number</Text>
            <Text style={styles.contactValue}>{restaurantInfo.phone}</Text>
          </View>
          <Text style={styles.contactAction}>Tap to Call</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactItem} onPress={sendEmail}>
          <Text style={styles.contactIcon}></Text>
          <View style={styles.contactTextContainer}>
            <Text style={styles.contactLabel}>Email Address</Text>
            <Text style={styles.contactValue}>{restaurantInfo.email}</Text>
          </View>
          <Text style={styles.contactAction}>Tap to Email</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactItem} onPress={openMaps}>
          <Text style={styles.contactIcon}></Text>
          <View style={styles.contactTextContainer}>
            <Text style={styles.contactLabel}>Location</Text>
            <Text style={styles.contactValue}>{restaurantInfo.address}</Text>
          </View>
          <Text style={styles.contactAction}>Get Directions</Text>
        </TouchableOpacity>
      </View>

      {/* Hours of Operation */}
      <View style={styles.infoCard}>
        <Text style={styles.infoCardTitle}>Hours of Operation</Text>
        
        <View style={styles.hoursContainer}>
          {Object.entries(restaurantInfo.hours).map(([day, hours]) => (
            <View key={day} style={styles.hoursRow}>
              <Text style={styles.hoursDay}>
                {day.charAt(0).toUpperCase() + day.slice(1)}:
              </Text>
              <Text style={styles.hoursTime}>{hours}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.hoursNote}>
          <Text style={styles.hoursNoteText}>
            * Kitchen closes 30 minutes before closing time
          </Text>
          <Text style={styles.hoursNoteText}>
            ** Reservations recommended for weekends
          </Text>
        </View>
      </View>

      {/* Social Media */}
      <View style={styles.infoCard}>
        <Text style={styles.infoCardTitle}>Follow Us</Text>
        <Text style={styles.socialMediaText}>
          Stay connected for daily specials and events
        </Text>
        
        <View style={styles.socialMediaContainer}>
          <View style={styles.socialMediaItem}>
            <Text style={styles.socialMediaIcon}></Text>
            <Text style={styles.socialMediaHandle}>
              @{restaurantInfo.socialMedia.instagram}
            </Text>
          </View>
          
          <View style={styles.socialMediaItem}>
            <Text style={styles.socialMediaIcon}></Text>
            <Text style={styles.socialMediaHandle}>
              {restaurantInfo.socialMedia.facebook}
            </Text>
          </View>
          
          <View style={styles.socialMediaItem}>
            <Text style={styles.socialMediaIcon}></Text>
            <Text style={styles.socialMediaHandle}>
              @{restaurantInfo.socialMedia.twitter}
            </Text>
          </View>
        </View>
      </View>

      {/* Additional Information */}
      <View style={styles.infoCard}>
        <Text style={styles.infoCardTitle}>Additional Information</Text>
        
        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}></Text>
            <Text style={styles.featureText}>Complimentary Valet Parking</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}></Text>
            <Text style={styles.featureText}>Vegetarian & Vegan Options</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}></Text>
            <Text style={styles.featureText}>Private Event Catering</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}></Text>
            <Text style={styles.featureText}>Takeout & Delivery Available</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}></Text>
            <Text style={styles.featureText}>All Major Credit Cards Accepted</Text>
          </View>
        </View>
      </View>

      {/* Footer Spacer */}
      <View style={styles.footerSpacer} />
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeTitle}>Christoffel's Menu</Text>
        <Text style={styles.welcomeSubtitle}>
          "Crafting Heavenly Dishes & Menus!"
        </Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'home' && styles.activeTab]}
          onPress={() => setActiveTab('home')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'home' && styles.activeTabText,
            ]}
          >
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'form' && styles.activeTab]}
          onPress={() => setActiveTab('form')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'form' && styles.activeTabText,
            ]}
          >
            Add Item
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'menu' && styles.activeTab]}
          onPress={() => setActiveTab('menu')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'menu' && styles.activeTabText,
            ]}
          >
            View Menu
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'planner' && styles.activeTab]}
          onPress={() => setActiveTab('planner')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'planner' && styles.activeTabText,
            ]}
          >
            Planner
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'guest' && styles.activeTab]}
          onPress={() => setActiveTab('guest')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'guest' && styles.activeTabText,
            ]}
          >
            Guest View
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'contact' && styles.activeTab]}
          onPress={() => setActiveTab('contact')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'contact' && styles.activeTabText,
            ]}
          >
            Contact
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'home' ? renderHome() : 
       activeTab === 'form' ? renderForm() : 
       activeTab === 'menu' ? renderMenu() : 
       activeTab === 'planner' ? renderMenuPlanner() : 
       activeTab === 'guest' ? renderGuestView() : renderContactInfo()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffffff',
  },
  header: {
    backgroundColor: '#6d06cdff',
    padding: 20,
    paddingTop: 40,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000ff',
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#000000ff',
    textAlign: 'center',
    marginTop: 5,
    opacity: 0.9,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#6d06cdff',
    borderBottomWidth: 1,
    borderBottomColor: '#6d06cdff',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#000000ff',
  },
  tabText: {
    fontSize: 10,
    color: '#000000ff',
    fontWeight: '500',
    textAlign: 'center',
  },
  activeTabText: {
    color: '#000000ff',
    fontWeight: 'bold',
  },
  // Contact Info Styles
  contactContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contactContent: {
    flexGrow: 1,
  },
  contactHeader: {
    backgroundColor: '#6d06cdff',
    padding: 25,
    paddingBottom: 20,
  },
  contactTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000ff',
    textAlign: 'center',
    marginBottom: 5,
  },
  contactSubtitle: {
    fontSize: 16,
    color: '#000000ff',
    textAlign: 'center',
    opacity: 0.9,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000ff',
    marginBottom: 15,
  },
  infoCardText: {
    fontSize: 16,
    color: '#000000ff',
    lineHeight: 22,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  contactIcon: {
    fontSize: 24,
    marginRight: 15,
    width: 30,
  },
  contactTextContainer: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000ff',
  },
  contactAction: {
    fontSize: 12,
    color: '#6d06cdff',
    fontWeight: '600',
  },
  hoursContainer: {
    marginBottom: 15,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  hoursDay: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000ff',
    textTransform: 'capitalize',
  },
  hoursTime: {
    fontSize: 16,
    color: '#6d06cdff',
    fontWeight: '600',
  },
  hoursNote: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  hoursNoteText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 2,
  },
  socialMediaText: {
    fontSize: 16,
    color: '#000000ff',
    marginBottom: 15,
    textAlign: 'center',
  },
  socialMediaContainer: {
    gap: 12,
  },
  socialMediaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  socialMediaIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 30,
  },
  socialMediaHandle: {
    fontSize: 16,
    color: '#000000ff',
    fontWeight: '500',
  },
  featureList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  featureIcon: {
    fontSize: 18,
    marginRight: 12,
    width: 30,
  },
  featureText: {
    fontSize: 16,
    color: '#000000ff',
  },
  // Guest View Styles
  guestContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  guestHeader: {
    backgroundColor: '#6d06cdff',
    padding: 20,
    paddingBottom: 15,
  },
  guestSubtitle: {
    fontSize: 16,
    color: '#000000ff',
    textAlign: 'center',
    marginTop: 5,
    opacity: 0.9,
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000ff',
    marginBottom: 10,
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#E9ECEF',
    minWidth: 100,
    alignItems: 'center',
  },
  filterButtonActive: {
    borderColor: '#6d06cdff',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000ff',
  },
  filterButtonTextActive: {
    color: '#000000ff',
    fontWeight: 'bold',
  },
  guestSummary: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  guestSummaryText: {
    fontSize: 16,
    color: '#6d06cdff',
    fontWeight: '600',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  guestList: {
    flex: 1,
    padding: 15,
  },
  guestMenuItem: {
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 4,
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  guestItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  guestItemTitle: {
    flex: 1,
    marginRight: 10,
  },
  guestItemName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#292F36',
    marginBottom: 5,
  },
  guestCourseBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  guestCourseBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  guestItemPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6d06cdff',
  },
  guestItemDescription: {
    fontSize: 16,
    color: '#000000ff',
    lineHeight: 22,
    marginBottom: 15,
  },
  guestItemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  guestItemEmoji: {
    fontSize: 24,
  },
  guestItemCourseHint: {
    fontSize: 14,
    color: '#6C757D',
    fontStyle: 'italic',
    flex: 1,
    textAlign: 'right',
  },
  guestStats: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  guestStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  guestStatCard: {
    alignItems: 'center',
    flex: 1,
  },
  guestStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6d06cdff',
    marginBottom: 5,
  },
  guestStatLabel: {
    fontSize: 12,
    color: '#6C757D',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  guestStatIndicator: {
    width: 30,
    height: 4,
    borderRadius: 2,
  },
  // Home Screen Scroll Styles
  homeScrollContainer: {
    flex: 1,
    backgroundColor: '#ffffffff',
  },
  homeScrollContent: {
    flexGrow: 1,
  },
  homeContainer: {
    padding: 20,
  },
  overallStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6d06cdff',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  subTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000ff',
    marginBottom: 15,
  },
  courseStatsContainer: {
    marginBottom: 30,
  },
  courseStatCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  courseStatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  courseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#292F36',
  },
  countBadge: {
    backgroundColor: '#6d06cdff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6d06cdff',
  },
  noItemsText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 5,
  },
  // New Home Screen Sections
  recentActivity: {
    marginBottom: 30,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityText: {
    fontSize: 16,
    color: '#000000ff',
    marginBottom: 8,
  },
  highlightText: {
    fontWeight: 'bold',
    color: '#6d06cdff',
  },
  noActivityText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  tipsSection: {
    marginBottom: 30,
  },
  tipCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipText: {
    fontSize: 16,
    color: '#000000ff',
    marginBottom: 10,
    lineHeight: 22,
  },
  quickActions: {
    marginBottom: 30,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    width: '48%',
    backgroundColor: '#6d06cdff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  plannerButton: {
    backgroundColor: '#8a2be2',
  },
  guestButton: {
    backgroundColor: '#17a2b8',
  },
  contactButton: {
    backgroundColor: '#28a745',
  },
  removeAllButton: {
    backgroundColor: '#dc3545',
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  footerSpacer: {
    height: 20,
  },
  // Menu Planner Styles
  plannerContainer: {
    flex: 1,
    padding: 20,
  },
  plannerHeader: {
    marginBottom: 20,
  },
  plannerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  plannerActionButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  addAllButton: {
    backgroundColor: '#28a745',
  },
  clearButton: {
    backgroundColor: '#dc3545',
  },
  plannerActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  plannerSummary: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000ff',
  },
  summaryCount: {
    color: '#6d06cdff',
    fontWeight: 'bold',
  },
  summaryTotal: {
    color: '#28a745',
    fontWeight: 'bold',
  },
  plannerList: {
    flex: 1,
    marginBottom: 20,
  },
  plannerItem: {
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  selectedPlannerItem: {
    backgroundColor: '#f0f8ff',
    borderColor: '#6d06cdff',
    borderWidth: 2,
  },
  plannerItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  plannerItemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#292F36',
    flex: 1,
    marginRight: 10,
  },
  plannerItemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6d06cdff',
  },
  plannerItemDescription: {
    fontSize: 14,
    color: '#000000ff',
    lineHeight: 20,
    marginBottom: 12,
  },
  plannerItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  plannerItemActions: {
    alignItems: 'flex-end',
  },
  selectedBadge: {
    backgroundColor: '#28a745',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  selectedBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  removeHintText: {
    fontSize: 12,
    color: '#dc3545',
    fontStyle: 'italic',
  },
  removeHintTextSmall: {
    fontSize: 10,
    color: '#dc3545',
    fontStyle: 'italic',
    textAlign: 'right',
  },
  selectedPreview: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
  },
  previewScroll: {
    flexDirection: 'row',
  },
  previewItem: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 6,
    marginRight: 10,
    minWidth: 120,
    alignItems: 'center',
  },
  previewItemName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#292F36',
    textAlign: 'center',
    marginBottom: 5,
  },
  previewItemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6d06cdff',
    marginBottom: 3,
  },
  previewItemCourse: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  // Menu Screen Styles
  menuContainer: {
    flex: 1,
  },
  menuHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalContainer: {
    backgroundColor: '#ffffffff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  totalText: {
    color: '#000000ff',
    fontSize: 14,
    fontWeight: '600',
  },
  totalCount: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  removeAllHeaderButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  removeAllHeaderText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#6C757D',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateSubText: {
    fontSize: 14,
    color: '#ADB5BD',
    textAlign: 'center',
  },
  menuList: {
    flex: 1,
    padding: 20,
  },
  menuItem: {
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  menuItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  menuItemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#292F36',
    flex: 1,
    marginRight: 10,
  },
  menuItemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6d06cdff',
  },
  menuItemDescription: {
    fontSize: 14,
    color: '#000000ff',
    lineHeight: 20,
    marginBottom: 12,
  },
  menuItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  courseBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  courseBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Form Styles
  formContainer: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000ff',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#ffffffff',
    borderWidth: 1,
    borderColor: '#000000ff',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: '#000000ff',
    marginBottom: 15,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000ff',
    marginBottom: 10,
  },
  courseContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  courseButton: {
    flex: 1,
    marginHorizontal: 5,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#000000ff',
    alignItems: 'center',
  },
  courseButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000ff',
  },
  courseButtonTextSelected: {
    color: '#000000ff',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#6d06cdff',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  removeAllButtonForm: {
    backgroundColor: '#dc3545',
    marginTop: 10,
  },
  addButtonText: {
    color: '#000000ff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ChefApp;
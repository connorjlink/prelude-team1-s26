import { Tab, TabIndicator,Box, TabList, TabPanel, TabPanels, Tabs, Center } from '@chakra-ui/react'
import Stay from '../../Pages/Stay/Stay';
import React from 'react'
import { InputBox } from '../../Pages/ThingsTodo/InputBox'
import Flights from '../../Pages/Flights/Flight'

const MainInputBox = () => {
  return (
    <Box className="travel-search" width={'85%'} m={'auto'} mt={10} border='1px solid #BDBDBD' borderRadius='7px' >
            <Tabs position="relative" variant="unstyled"  >
                <Center>
                    <TabList borderBottom='1px solid #BDBDBD' width={'80%'} justifyContent={'space-evenly'} pt={5} pb={3} >
                                <Tab className="travel-tab" _selected={{ color: 'var(--coral)' }} fontWeight='semibold'>Stays</Tab>
                                <Tab className="travel-tab" _selected={{ color: 'var(--coral)' }} fontWeight='semibold'>Flights</Tab>
                                <Tab className="travel-tab" _selected={{ color: 'var(--coral)' }} fontWeight='semibold'>Cars</Tab>
                                <Tab className="travel-tab" _selected={{ color: 'var(--coral)' }} fontWeight='semibold'>Things to do</Tab>
                                <Tab className="travel-tab" _selected={{ color: 'var(--coral)' }} fontWeight='semibold'>Packages</Tab>
                    </TabList>
                </Center>
                <TabIndicator
                mt="-1.5px"
                height="2px"
                bg="var(--coral)"
                borderRadius="1px"
                />
                <TabPanels>
                    <TabPanel className="travel-panel">
                    <Stay/>
                    </TabPanel>
                    <TabPanel className="travel-panel">
                        <Flights/>
                    </TabPanel>
                    <TabPanel className="travel-panel">
                        <div className="travel-placeholder">
                          <strong className="search-panel-title">Cars</strong>
                          <span>Plan a smoother road trip with Prelude.</span>
                        </div>
                    </TabPanel>
                    <TabPanel className="travel-panel">
                        <InputBox/>
                    </TabPanel>
                    <TabPanel className="travel-panel">
                        <div className="travel-placeholder">
                          <strong className="search-panel-title">Packages</strong>
                          <span>Bundle your next journey in one simple plan.</span>
                        </div>
                    </TabPanel>
                </TabPanels>
            </Tabs>
    </Box>
  )
}

export default MainInputBox
